var phantom = require('phantom');
var swig  = require('swig');
var fs = require('fs');

function createPostionSettings(positionIn) {

  var imagePrefix = "<img src='img/";
  var imageSuffix = ".png'>";

  var positionSettings = {};

  for (var prop in positionIn) {
    positionSettings[prop] = imagePrefix + positionIn[prop] + imageSuffix;
  }

  return positionSettings;
}

function writeTemplate(position, boardFileName) {

  swig.setDefaults({ cache: false, autoescape: false });

  // Compile the template file
  var tpl = swig.compileFile('chessboard.tpl.html');

  // Render the position
  var rendered = tpl(position);

  // Write out the
  fs.writeFile(boardFileName, rendered, function(err) {
    if (err) {
      return console.log(err);
    }
    console.log('writting '+boardFileName+' done');
  });
}

function renderBoard(boardFileName) {

  phantom.create("--ignore-ssl-errors=yes", "--ssl-protocol=any", "--web-security=no", function (ph) {//mMAKE SURE WE CAN RENDER https
    ph.createPage(function (page) {
      //CREATE PAGE OBJECT
      page.set('viewportSize', {width:1280,height:900}, function(){
        page.set('clipRect', {top:0,left:0,width:1280,height:900}, function(){
          //OPEN PAGE
          page.open(boardFileName, function(status) {
            //WAIT 15 SECS FOR WEBPAGE TO BE COMPLETELY LOADED
            setTimeout(function(){
              page.render('chessboard.png', function(finished){
                console.log('rendering '+boardFileName+' done');
                ph.exit();
              });
            }, 1500);
          });
          //END OF: OPEN PAGE
        });
      });
      //END OF: CREATE PAGE OBJECT
    });
  });

}

// main

var boardFileName = "chessboard.html";

var position = createPostionSettings({
  h1: "bB",
  g8: "wK"
});

writeTemplate(position, boardFileName);
renderBoard(boardFileName);


