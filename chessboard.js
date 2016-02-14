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
function writeTemplate(position, boardTemplateFileName, boardFileName) {

  swig.setDefaults({ cache: false, autoescape: false });

  // Compile the board template file
  var tpl = swig.compileFile(boardTemplateFileName);

  // Render the position
  var rendered = tpl(position);

  // Write out the board file
  fs.writeFile(boardFileName, rendered, function(err) {
    if (err) {
      return console.log(err);
    }
    console.log('writting '+boardFileName+' done');
  });
}

/**
 * Render the board html file as an image file (png)
 */
function renderBoard(boardFileName, boardImageFileName) {

  phantom.create("--ignore-ssl-errors=yes", "--ssl-protocol=any", "--web-security=no", function (ph) {
    ph.createPage(function (page) {
      // create page object
      page.set('viewportSize', {width:1280,height:900}, function(){
        page.set('clipRect', {top:0,left:0,width:1280,height:900}, function(){
          // open page
          page.open(boardFileName, function(status) {
            // wait 1.5 seconds for webpage to be completely loaded
            setTimeout(function(){
              page.render(boardImageFileName, function(finished){
                console.log('rendering '+boardFileName+' as '+boardImageFileName+' done');
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

var boardTemplateFileName = "chessboard.tpl.html";
var boardFileName = "chessboard.html";
var boardImageFileName = "chessboard.png";

var position = createPositionSettings({
  h1: "bB",
  b1: "wQ",
  g8: "wK"
});

writeTemplate(position, boardTemplateFileName, boardFileName);
renderBoard(boardFileName, boardImageFileName);


