// <script src="../JS/Visibility.js"  type="module"></script>
let viewResult=[];
window.viewResult = viewResult; // 将变量赋值给全局对象
function addVoxel(lon1, lat1, diff, baseHeight)
{

    let dz = diff * 111000 //经纬度转米
    let instances = [];
    let lon = lon1
    let lat = lat1
    var position = Cesium.Rectangle.fromDegrees(lon, lat, lon + diff, lat + diff)//西南角加东北角
    instances.push(new Cesium.GeometryInstance({
        geometry: new Cesium.RectangleGeometry({
            rectangle: position,
            height:  baseHeight,
            extrudedHeight: baseHeight+dz,
            vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEXT_FORMAT
        }),
    }));

    let react = viewer.scene.primitives.add(new Cesium.Primitive({
        show:true,
        asynchronous:false,
        geometryInstances: instances,
        appearance: new Cesium.PerInstanceColorAppearance({
            flat: true,  //不考虑照明
            translucent: true,  //透明显示
        })
    }));

    // console.log(react);
    return react;
}


//为体素赋值
function getVoxel(lon, lat, diff, baseHeight)
{
    let inputText = document.getElementById("num").value;
    console.log(inputText);
    console.log(pointsSet.length);
    //一共10排，东西方向
    // for(var i=0;i<1;i++)
    // {
        tempLon=lon-inputText*diff;//经度
        //高为5个体素
        for (var j = 0; j < 5; j++)
        {
           tempHeight=baseHeight+diff*111000*j;
            //一行20个体素，南北方向
            for (var k = 0; k <20; k++)
            {
                var data=2;
                tempLat=lat+k*diff;//纬度
                let react=addVoxel(tempLon, tempLat, diff, tempHeight );
                react.readyPromise.then(function() {
                    console.log(react.ready);
                    for (var l=0;l<pointsSet.length;l++)
                        {
                            data=getIntersectPoint(pointsSet[l][0],pointsSet[l][1])
                            if(data==1) break;
                        }
                    viewResult.push(data);
                    react.show=false;
                    // viewer.scene.primitives.remove(react);
                });
            }
        }
    // }
    console.log(viewResult);
}

//计算两点连成的直线段与地形/建筑的交点，并绘制可视线
function getIntersectPoint(startPoint,endPoint)
{
    //计算两点连线的方向
    let direction = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(endPoint,startPoint,new Cesium.Cartesian3()),new Cesium.Cartesian3());
    //建立射线
    let ray = new Cesium.Ray(startPoint,direction);
    //计算相交点，注意，这里的相交点有可能比终点更远
    let result = viewer.scene.pickFromRay(ray,[]);
    if(Cesium.defined(result))
    {
        let intesectPosition = result.position;
        if(Cesium.Cartesian3.distance(startPoint,endPoint)>=Cesium.Cartesian3.distance(intesectPosition,startPoint)) {
            return 1;
        }
    }
    else
    {
         return 2;
    }
}

function remove(){
    viewer.scene.primitives.removeAll();
    viewer.scene.globe.depthTestAgainstTerrain = false;
}
var sleep = function(time) {
    var startTime = new Date().getTime() + parseInt(time, 10);
    while(new Date().getTime() < startTime) {}
};

//增加场景建筑
function addbuildings(){
    /** 加载建筑物*/
    var tileset = new Cesium.Cesium3DTileset({
        url: "http://localhost:8080/Buildings/tileset.json"
    });

    tileset.readyPromise.then(function(tileset) {
        viewer.scene.primitives.add(tileset);
        var heightOffset = 0;  //设置建筑物与地面的高度
        var boundingSphere = tileset.boundingSphere;
        var cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);
        var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
        var offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, heightOffset);
        var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
        tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
        // viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0.5, -0.2, tileset.boundingSphere.radius * 1.0));
    });


    tileset.style = new Cesium.Cesium3DTileStyle({
        defines: {
            latitudeRadians: 'radians(${max_day})'
        },
        color: "#AAAAAA",

    });
}