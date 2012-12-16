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

// An array that serves as a cache of all requested jQuery objects and is populated by calling the GetjQueryReference method below. If the 
// element you need is dynamically created, pass 'false' as the 2nd parameter of the GetjQueryReference call so that the reference is not cached.
var g_arrJQueryReferences = [];



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

// Helper to make sure text added to an attribute is encoded correctly (we don't want cross-site scripting attacks or a broken page due to a
// javascript error)
function EncodeTextForHTMLAttribute(sValue)
{
    return sValue.replace(g_rexQuot, "&quot;");
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




// Helper to make getting a jQuery reference easier. Rather than using several member variables, a UI view will have access to a single 
// g_arrJQueryReferences array object that this function will use as a cache (all views use this file so they all have access to this 
// functionality - the array is defined at the top of this file)
//
// sCtrlID is the ID applied to the control (don't include '#')
// bUseCache (optional) - true by default. If false, will pull from the DOM directly.
function GetjQueryReference(sCtrlID, bUseCache) {
    // If the caller didn't specify the bUseCache parameter then set it to 'true' by default
    if ((bUseCache === null) || (typeof bUseCache === "undefined")) { bUseCache = true; }


    // If we are to use the cache then grab the requested control from our global array
    var $jQueryObj = null;
    if (bUseCache === true) { $jQueryObj = g_arrJQueryReferences[sCtrlID]; }

    // If we don't have a control reference yet then grab the reference from the DOM
    if (($jQueryObj === null) || (typeof $jQueryObj === "undefined")) { $jQueryObj = $(("#" + sCtrlID)); }

    // If we're using cache then save our object reference to the array
    if (bUseCache) { g_arrJQueryReferences[sCtrlID] = $jQueryObj; }

    // Return the jQuery object to the caller
    return $jQueryObj;
}