
function ResizeToFitArtboard(context) {

  var sketch = context.api()
  sketch.log("resizeToFitArtboard:Sketch version is " + sketch.version)
  sketch.log("resizeToFitArtboard:Sketch API version is " + sketch.api_version)

  var document = sketch.selectedDocument
  var page = document.currentPage
  var c_selection = context.selection // 当前选中内容

  if (context.selection.count() == 0) {
    context.document.showMessage('Please select some objects.');
    return;
  }

  var iter = c_selection.objectEnumerator()
  var c_layer = iter.nextObject()
  var selectedArtboard = getParentArtboard(c_layer)  // 当前所在画板
  log("resizing: "+selectedArtboard)
  if (selectedArtboard == null) {
    context.document.showMessage('No artboard found.');
    return;
  }

  //获取画布和选中内容的尺寸
  artboard_width = getArtboardSize(selectedArtboard).w
  artboard_height = getArtboardSize(selectedArtboard).h
  layer_width = getSelectionSize(c_selection).w
  layer_height = getSelectionSize(c_selection).h
  layer_x = getSelectionSize(c_selection).x
  layer_y = getSelectionSize(c_selection).y

  //calculate scale ratio
  var rate = 1
  var layer_ratio=layer_width/layer_height

  if (layer_ratio <= 1){
      rate = artboard_height/layer_height
  } else {
      rate = artboard_width/layer_width
  }
  //calculate offset
  offset_x = layer_x
  offset_y = layer_y
  log("resizeToFitArtboard: offset_x" + offset_x);
  log("resizeToFitArtboard: offset_y" + offset_y);

  //do resizing
  resizeAllLayerByScale(selectedArtboard, rate, offset_x, offset_y)

  doc.reloadInspector()
}

// resize selected layers by scale ratio
function resizeAllLayerByScale(artboard, rate, offset_x, offset_y){
  var layers = artboard.children()

  for (i=0;i<layers.length;i++){
    var layer = layers[i];
    log("resizeToFitArtboard: layer i " + layer)

    // Do not resize artboard
    if (layer.parentGroup().className() == 'MSArtboardGroup'){
    //& !(layer.className() == 'MSArtboardGroup')) {
        var layer_offset_x = layer.frame().minX() - offset_x
        var layer_offset_y = layer.frame().minY() - offset_y

        log("resizeToFitArtboard: layer parent " +layer.parentGroup().className())
        log("resizeToFitArtboard: layer i offset x " + layer_offset_x)
        log("resizeToFitArtboard: layer i offset y " + layer_offset_y)

        var frame = layer.frame();
        layer.frame().setX(rate * layer_offset_x);
        log("resizeToFitArtboard: layer move xto " + rate * (frame.x() - layer_offset_x));
        layer.frame().setY(rate * layer_offset_y);
        log("resizeToFitArtboard: layer move yto " + rate * (frame.y() - layer_offset_y));
        layer.constrainProportions = true;
        layer.setWidthRespectingProportions(frame.width() * rate);
        //layer.setHeightRespectingProportions(frame.height() * rate);
        log("resizeToFitArtboard: resize rate:" + rate)
        log("resizeToFitArtboard: layer result:" + layer.frame())
    }
  }
}

//getParentArtboard(layer)
function getParentArtboard(layer) {
  if (layer == undefined) {
		return null;
	}
  var currentLayer = layer;

  while (true) {
    var className = currentLayer.className();
    if (className == 'MSPage') {
      return null;
      break;
    } else if (className == 'MSArtboardGroup') {
      break;
    } else {
      currentLayer = currentLayer.parentGroup();
    }
  }
  return currentLayer;
}

function getArtboardSize(artboard){

    minX = artboard.frame().minX()
    maxX = artboard.frame().maxX()
    minY = artboard.frame().minY()
    maxY = artboard.frame().maxY()

  return {
    w: maxX-minX,
    h: maxY-minY,
    x: minX,
    y: minY
  };

}

// get selection edge size
function getSelectionSize(sel) {
  var minX,minY,maxX,maxY;
  minX=minY=Number.MAX_VALUE;
  maxX=maxY=-0xFFFFFFFF;

  for(var i=0;i<sel.count();i++) {
    var rect=sel.objectAtIndex(i).frame();

    minX=Math.min(minX,rect.minX());
    minY=Math.min(minY,rect.minY());
    maxX=Math.max(maxX,rect.maxX());
    maxY=Math.max(maxY,rect.maxY());
  }

  return {
    w: maxX-minX,
    h: maxY-minY,
    x: minX,
    y: minY
  };
}
