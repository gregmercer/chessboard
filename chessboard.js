var phantom = require('phantom');
var swig  = require('swig');
var fs = require('fs');

var pageUrl = "chessboard.html";

var imagePrefix = "<img src='img/";
var imageSuffix = ".png'>";

swig.setDefaults({ cache: false, autoescape: false });

// Compile a file and store it, rendering it later
var tpl = swig.compileFile('chessboard.tpl.html');

var rendered = tpl({
  a3: imagePrefix + "bB" + imageSuffix,
  b8: imagePrefix + "wK" + imageSuffix
});

fs.writeFile(pageUrl, rendered, function(err) {
  if (err) {
    return console.log(err);
  }
  console.log('writting '+pageUrl+' done');
});

phantom.create("--ignore-ssl-errors=yes", "--ssl-protocol=any", "--web-security=no", function (ph) {//mMAKE SURE WE CAN RENDER https
  ph.createPage(function (page) {
    //CREATE PAGE OBJECT
    page.set('viewportSize', {width:1280,height:900}, function(){
      page.set('clipRect', {top:0,left:0,width:1280,height:900}, function(){
        //OPEN PAGE
        page.open(pageUrl, function(status) {
          //WAIT 1.5 SECS FOR WEBPAGE TO BE COMPLETELY LOADED
          setTimeout(function(){
            page.render('chessboard.png', function(finished){
              console.log('rendering '+pageUrl+' done');
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
