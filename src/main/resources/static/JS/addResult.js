function ColorMap(value) {
    let Color1
    Colors =
        {
            '0': [238, 238, 238, 100], //灰白
            '1': [187, 68, 92, 255], //深红
            '2':[51, 102, 153, 255]  //深蓝
        }
    if (value == 0)
    {
        Color1 = Colors['0']
    }
    else if (value == 1)
    {
        Color1 = Colors['1']
    }
    else if (value == 2) {
        Color1 = Colors['2']
    }

    return Color1
}

function makeColor0(data) {
    let colors = []
    colors.push(ColorMap(data))
    return colors
}

function addRectangle(data, lon1, lat1, diff, baseHeight)
{

    let dz = diff * 111000 //经纬度转米
    let colors = makeColor0(data)
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
        attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                Cesium.Color.fromBytes(
                    colors[0][0],
                    colors[0][1],
                    colors[0][2],
                    colors[0][3]))
        }
    }));

    var react = viewer.scene.primitives.add(new Cesium.Primitive({
        geometryInstances: instances,
        appearance: new Cesium.PerInstanceColorAppearance({
            flat: true,  //不考虑照明
            translucent: true,  //透明显示
            // allowPicking: false, //允许碰撞检测
        })
    }));
    return react;
}

var count=0;
//渲染体素
function createRectangles(data, lon, lat, diff, baseHeight)
{
    var num=0;
    //一共10排，东西方向
    for(var i=0;i<5;i++)
    {
        tempLon=lon-i*diff;//经度
        //高为5个体素
        for (var j = 0; j <5; j++)
        {
            tempHeight=baseHeight+diff*111000*j;
            //一行20个体素，南北方向
            for (var k = 0; k < 20; k++)
            {
                tempLat=lat+k*diff;//纬度
                console.log(viewResult[num]);
                addRectangle(viewResult[num], tempLon, tempLat, diff, tempHeight );
                num=num+1;
                if(viewResult[num]==1) count++;
            }
        }
    }
    console.log('不可视体素个数'+count)
}



