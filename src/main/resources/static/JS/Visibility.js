//添加鼠标左键处理事件
var frustrumLabel = undefined; //可视域分析中的鼠标提示
var viewPointFlag = false; //是否选择了视点
var pickPositions = []; //被选中的点的坐标
var boardLines = []; //可视区域边界线
var pickPoints = []; //被选中的点
var activeLine; //视野方向线
var resultCount=0;
var lineCount=0;
let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
let pointsSet = [];//存储碰撞点和终点
window.pointsSet = pointsSet; // 将变量赋值给全局对象
function setBuildFrustrumHandler(flag){
    if(flag){
        // handler.setInputAction(function (event) {
        // const earthPosition = viewer.scene.pickPosition(event.position);
        // // `earthPosition` will be undefined if our mouse is not over the globe.
        // if (Cesium.defined(earthPosition)) {
        pickPositions[0]= Cesium.Cartesian3.fromDegrees(118.78301901446417,31.91553002059641,5);
        pickPositions[1]= Cesium.Cartesian3.fromDegrees(118.74625052206892,31.924350225484293,5);
        if(pickPositions.length > 1){
            //进行可视化分析
            //先清除边界线
            for(let i=0;i<boardLines.length;++i){
                viewer.entities.remove(boardLines[i]);
            }
            // frustrumLabel.label.text = "可视域分析中...";
            //分析完毕清除鼠标事件
            setBuildFrustrumHandler(false);
            //进行可视域分析
            //这个角度控制水平角度
            viewAreaAnalysis(30,pickPositions[0],pickPositions[1]);
        }

        viewPointFlag = true;
        const dynamicPositions = new Cesium.CallbackProperty(function () {
            return pickPositions;
        }, false);
        // pickPositions.push(earthPosition);
        activeLine = drawLine(dynamicPositions,Cesium.Color.WHITE,Cesium.Color.WHITE);
    }
    // } // Cesium.ScreenSpaceEventType.LEFT_CLICK);
    // }
    // else{
    //     handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    //     handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    // }
}


//求扇形可视区域的两条边界线(视野范围)
// function drawSector(startPoint,endPoint){
//     let lines = [];
//     let leftLine = rotateLine(Cesium.Math.toRadians(45),startPoint,endPoint);
//     let rightLine = rotateLine(Cesium.Math.toRadians(-45),startPoint,endPoint);
//     lines.push(leftLine);
//     lines.push(rightLine);
//     return lines;
// }

//画出某条直线段绕起点逆时针旋转radian(弧度)后的线段
function rotateLine(radian,startPoint,endPoint){
    let position_Cartesian3 = rotatePoint(radian,startPoint,endPoint);
    let LinePoints = [];
    LinePoints.push(startPoint);
    LinePoints.push(position_Cartesian3);
    let line = drawLine(LinePoints,new Cesium.PolylineDashMaterialProperty({color:Cesium.Color.YELLOW}),Cesium.Color.YELLOW);
    return line;
}

//计算某一点绕另一点水平旋转radian后的终点坐标
function rotatePoint(radian,startPoint,endPoint){
    let startCartographic  = Cesium.Cartographic.fromCartesian(startPoint); //起点经纬度坐标
    let endCartographic = Cesium.Cartographic.fromCartesian(endPoint); //终点经纬度坐标
    //初始化投影坐标系
    /*假设对图片上任意点a，绕一个坐标点o逆时针旋转angle角度后的新的坐标点b，有公式：
    b.x = ( a.x - o.x)*cos(angle) - (a.y - o.y)*sin(angle) + o.x
    b.y = (a.x - o.x)*sin(angle) + (a.y - o.y)*cos(angle) + o.y*/
    let webMercatorProjection = new Cesium.WebMercatorProjection(viewer.scene.globe.ellipsoid);
    let startMercator = webMercatorProjection.project(startCartographic); //起点墨卡托坐标
    let endMercator = webMercatorProjection.project(endCartographic); //终点墨卡托坐标
    //左边界线墨卡托坐标
    let position_Mercator = new Cesium.Cartesian3((endMercator.x-startMercator.x)*Math.cos(radian)-(endMercator.y-startMercator.y)*Math.sin(radian)+startMercator.x,
        (endMercator.x-startMercator.x)*Math.sin(radian)+(endMercator.y-startMercator.y)*Math.cos(radian)+startMercator.y,startMercator.z);
    //左边界线经纬度坐标
    let position_Cartographic = webMercatorProjection.unproject(position_Mercator);
    //左边界线笛卡尔空间直角坐标
    let position_Cartesian3 = Cesium.Cartographic.toCartesian(position_Cartographic.clone());
    return position_Cartesian3
}

//计算某一点绕另一点竖直旋转radian后的终点坐标
function rotateVerticalPoint(radian,startPoint,endPoint){
    let startCartographic  = Cesium.Cartographic.fromCartesian(startPoint); //起点经纬度坐标
    let endCartographic = Cesium.Cartographic.fromCartesian(endPoint); //终点经纬度坐标
    //初始化投影坐标系
    /*假设对图片上任意点a，绕一个坐标点o逆时针旋转angle角度后的新的坐标点b，有公式：
    Xc=Xa+(Xb-Xa)cosθ;Yc=Ya+(Yb-Ya)cosθ;Zc=Za+r*sinθ;*/
    let webMercatorProjection = new Cesium.WebMercatorProjection(viewer.scene.globe.ellipsoid);
    let startMercator = webMercatorProjection.project(startCartographic); //起点墨卡托坐标
    let endMercator = webMercatorProjection.project(endCartographic); //终点墨卡托坐标
    //左边界线墨卡托坐标
    let position_Mercator = new Cesium.Cartesian3(
        startMercator.x+(endMercator.x-startMercator.x)*Math.cos(radian),
        startMercator.y+(endMercator.y-startMercator.y)*Math.cos(radian),
        startMercator.z+(Math.sqrt(Math.pow(endMercator.x-startMercator.x, 2)
            +Math.pow(endMercator.y-startMercator.y, 2)
            +Math.pow(endMercator.z-startMercator.z, 2)))*Math.sin(radian));
    //左边界线经纬度坐标
    let position_Cartographic = webMercatorProjection.unproject(position_Mercator);
    //左边界线笛卡尔空间直角坐标
    let position_Cartesian3 = Cesium.Cartographic.toCartesian(position_Cartographic.clone());
    return position_Cartesian3
}
//绘制线
function drawLine(positionData,material,depthFailMaterial)
{
    let shape;
    shape = viewer.entities.add({
        polyline: {
            positions: positionData,
            arcType : Cesium.ArcType.NONE,
            width: 6, //线段宽度 越宽越接近面状
            material: material,
            depthFailMaterial: depthFailMaterial, //被地形遮挡部分的颜色
        },
    });
    return shape;
}

//可视化分析
function viewAreaAnalysis(degree,startPoint,endPoint){
     // viewer.scene.globe.depthTestAgainstTerrain = true;
    for(let i=-degree;i<=degree;++i){  //可以乘10以增加射线密度
        let radian = Cesium.Math.toRadians(i); //角度转弧度 //对应的要除以10
        let destPoint = rotatePoint(radian,startPoint,endPoint);  //转过一定角度后的终点
        getIntersectPoint(startPoint,destPoint);
        for(let j=0;j<=15;++j) {//控制竖直转过的角度 一般为15度
            let verticalRadian = Cesium.Math.toRadians(j);
            let destVerticalPoint=rotateVerticalPoint(verticalRadian,startPoint,destPoint);  //竖直方向转过一定角度后的终点
            getIntersectPoint(startPoint,destVerticalPoint);
            lineCount=lineCount+1;
        }
    }
    console.log("pointsSet:");
    console.log(pointsSet);
    // console.log(lineCount);
    // console.log(resultCount);
    // viewer.entities.remove(frustrumLabel);
    // viewer.entities.remove(activeLine);
    pickPositions = [];
    for(let i=0;i<pickPoints.length;++i){
        viewer.entities.remove(pickPoints[i]);
    }
    pickPoints = [];

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
        //判断相交点是否比终点更远
        if(Cesium.Cartesian3.distance(startPoint,endPoint)>=Cesium.Cartesian3.distance(intesectPosition,startPoint))
        {
            // drawLine([startPoint,result.position],Cesium.Color.GREEN.withAlpha(0.1),Cesium.Color.GREEN.withAlpha(0.1));
            drawLine([startPoint,result.position],Cesium.Color.GREEN.withAlpha(0.05),Cesium.Color.GREEN.withAlpha(0.05));

            drawLine([result.position,endPoint],Cesium.Color.RED.withAlpha(0.05),Cesium.Color.RED.withAlpha(0.05));
            // drawLine([result.position,endPoint],Cesium.Color.TRANSPARENT,Cesium.Color.TRANSPARENT);
            pointsSet.push([result.position,endPoint]);
            resultCount=resultCount+1;
        }
        else
        {
             // drawLine([startPoint,endPoint],Cesium.Color.WHITE,Cesium.Color.WHITE);
            // drawLine([startPoint,endPoint],Cesium.Color.GREEN.withAlpha(0.3),Cesium.Color.GREEN.withAlpha(0.3));
        }
    }
    else
    {
        // addRectangles0([0], 118.7848,118.7849, 31.9227, 31.9228,  0.0001, 1, 1, 1, 11.1);
        // drawLine([startPoint,endPoint],Cesium.Color.BLUE,Cesium.Color.BLUE);
        drawLine([startPoint,endPoint],Cesium.Color.BLUE.withAlpha(0.05),Cesium.Color.BLUE.withAlpha(0.05));
    }
}

//可视化分析（鼠标点击“可视域分析”按钮的响应事件）
window.viewAreaAnalysis = function(){
    viewer.entities.removeAll();
    pickPositions = [];
    boardLines = [];
    frustrumLabel = undefined;
    viewPointFlag = false;
    setBuildFrustrumHandler(true);
}


