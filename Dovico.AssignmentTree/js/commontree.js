//------------------------------
// Global variables
//------------------------------
var DB_TRUE = "T";
var DB_FALSE = "F";

var MIN_SETTIMOUT = 25;

var g_rexAmp = new RegExp("&", "g");
var g_rexQuot = new RegExp("\"", "g");
var g_rexLT = new RegExp("<", "g");
var g_rexGT = new RegExp(">", "g");


// Helper to make sure text added to an element/node is encoded correctly (we don't want cross-site scripting attacks or a broken page due to a
// javascript error)
function EncodeTextForElement(sValue)
{
    // Replace the &, <, and > characters with their encoded couterparts
    var sReturnValue = sValue.replace(g_rexAmp, "&amp;");
    sReturnValue = sReturnValue.replace(g_rexLT, "&lt;");
    sReturnValue = sReturnValue.replace(g_rexGT, "&gt;");

    // Return the encoded string
    return sReturnValue;
}


function EncodeHtml(sValue)
{
    // Replace the &, ', <, and > characters with their encoded counterparts
    var sReturnValue = sValue.replace(g_rexAmp, "&amp;");
    sReturnValue = sReturnValue.replace(g_rexQuot, "&quot;");
    sReturnValue = sReturnValue.replace(g_rexLT, "&lt;");
    sReturnValue = sReturnValue.replace(g_rexGT, "&gt;");

    // Return the encoded string
    return sReturnValue;
}

