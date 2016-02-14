var phantom = require('phantom');
var swig  = require('swig');
var fs = require('fs');

/**
 * Creates position settings based on position passed in.
 */
function createPositionSettings(positionIn) {

  var imagePrefix = "<img src='img/";
  var imageSuffix = ".png'>";

  var positionSettings = {};

  for (var prop in positionIn) {
    positionSettings[prop] = imagePrefix + positionIn[prop] + imageSuffix;
  }

  return positionSettings;
}

/**
 * Write out the rendered template file as an .html file
 */
function writeBoardTemplate(position, boardTemplateFile, boardHtmlFile) {

  swig.setDefaults({ cache: false, autoescape: false });

  // Compile the board template file
  var tpl = swig.compileFile(boardTemplateFile);

  // Render the position
  var rendered = tpl(position);

  // Write out the board file
  fs.writeFile(boardHtmlFile, rendered, function(err) {
    if (err) {
      return console.log(err);
    }
    console.log('writting '+boardHtmlFile+' done');
  });
}

/**
 * Render the board html file as an image file (png)
 */
function renderBoardImage(boardHtmlFile, boardImageFile) {

  phantom.create("--ignore-ssl-errors=yes", "--ssl-protocol=any", "--web-security=no", function (ph) {
    ph.createPage(function (page) {
      // create page object
      page.set('viewportSize', {width:1280,height:900}, function(){
        page.set('clipRect', {top:0,left:0,width:1280,height:900}, function(){
          // open page
          page.open(boardHtmlFile, function(status) {
            // wait 1.5 seconds for webpage to be completely loaded
            setTimeout(function(){
              page.render(boardImageFile, function(finished){
                console.log('rendering '+boardHtmlFile+' as '+boardImageFile+' done');
                ph.exit();
              });
            }, 1500);
          });
          // end 'open page'
        });
      });
      // end 'create page object'
    });
  });

}

/**
 * Main:
 *   - Create the board position settings
 *   - Write out the board html file, using the position and template
 *   - Render the board html file as an image
 */

var boardTemplateFile = "chessboard.tpl.html";
var boardHtmlFile = "chessboard.html";
var boardImageFile = "chessboard.png";

var position = createPositionSettings({
  h1: "bB",
  b1: "wQ",
  c2: "wQ",
  d3: "wQ",
  g8: "wK"
});

writeBoardTemplate(position, boardTemplateFile, boardHtmlFile);
renderBoardImage(boardHtmlFile, boardImageFile);
