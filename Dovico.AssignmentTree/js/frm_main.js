/// <reference path="jquery-1.6.2.min.js" />
/// <reference path="jquery-ui-1.8.16.custom.min.js" />
/// <reference path="commontree.js" />
/// <reference path="assignmenttree.js" />


// In some cases we may need to provide a full path. This is the IHttpHandler object that is to receive our AJAX calls
var g_sServerMethod = "servermethod.ashx";

// Class that handles building up the HTML for the Assignment tree
var g_AssignmentTree = null;

// Cached jQuery objects
var $g_divProject = null;
var $g_divTask = null;
var $g_dlgProjectTaskPicker = null; // Will hold the jQuery dialog object for the Project/Task picker
var $g_divMessage = null;


// Hooks into the document load event and is called when the page has finished loading
$(document).ready(function ()
{
    var $cmdProjTaskContainer = $("#cmdProjectTaskContainer");

    // If the message displayed is 'Loading...' then hide the message area since there were no errors thrown while starting up
    if (GetjQueryMessageDiv().text() === LOADING_MSG)
    {
        // Enable the button and then clear the message area
        $cmdProjTaskContainer.removeAttr("disabled");
        ClearMessageArea();
    }

    // Click event handler for the Project/Task container
    $cmdProjTaskContainer.click(function ()
    {
        // If we do not yet have an instance of the project/task picker jQuery object then....
        if ($g_dlgProjectTaskPicker === null)
        {
            // Create an instance of our dialog but don't have it auto open (the loading of the assignment tree control doesn't happen until the dialog
            // is opened for the first time when the OnOpen_dlgProjectTaskPicker function gets called). We're just creating an instance of the dialog
            // control itself at this point.
            $g_dlgProjectTaskPicker = $("#divProjectTaskPicker").dialog({
                autoOpen: false,
                title: "Project/Task Picker",
                resizable: false,
                modal: true,
                open: function (event, ui) { OnOpen_dlgProjectTaskPicker(); }
            });
        } // End if ($g_dlgProjectTaskPicker === null)


        // Display the Project/Task picker dialog
        $g_dlgProjectTaskPicker.dialog("open");
    });
});


// Called by the jQuery .dialog() code when the Project/Task Picker dialog is opened
function OnOpen_dlgProjectTaskPicker()
{
    // If we have not yet created the assignment tree then...
    if (g_AssignmentTree == null)
    {
        // Create a new instance of our assignment tree class (loads in the root level assignment items asynchronously)
        // 1st param - the parent control that this tree will be built in
        // 2nd param - the name of the global variable holding this tree control instance - needed by OnClick functions so that they can call 
        //              the proper class instance - I could have created the DOM objects first and then wired them up using addEventListener but
        //              I didn't. Feel free to modify if you'd like
        // 3rd param - the server-side method that is to receive our AJAX calls
        // 4th param - the callback function when an item is selected. will be passed an object containing: ClientName, ProjectID, ProjectName, 
        //              TaskID, and TaskName properties
        g_AssignmentTree = new CAssignmentTree("divTreePicker", "g_AssignmentTree", g_sServerMethod, OnItemSelected_dlgProjectTaskPicker);
    } // End if (!g_bTaskDialogDisplayedOnce)
    
    
    // Clear any error message that might have been displayed
    ClearMessageArea();
}


// Called by the OnClick_ItemSelected function (assignmenttree.js) when the user selects a task
// objSelectionInfo will contain: ClientName, ProjectID, ProjectName, TaskID, and TaskName properties
function OnItemSelected_dlgProjectTaskPicker(objSelectionInfo)
{
    // Close the Project/Task picker dialog
    $g_dlgProjectTaskPicker.dialog("close");

    // Have the UI updated with the selected Project and Task information
    UpdateDisplayWithSelectedProject(objSelectionInfo.ProjectID, objSelectionInfo.ProjectName);
    UpdateDisplayWithSelectedTask(objSelectionInfo.TaskID, objSelectionInfo.TaskName);
}


// Helper to get the Project div reference
function GetjQueryProjectDiv()
{
    // If we don't yet have the jQuery DOM element in cache, grab it now
    if ($g_divProject === null) { $g_divProject = $("#divProject"); }
    return $g_divProject;
}


// Helper to get the Task div reference
function GetjQueryTaskDiv()
{
    // If we don't yet have the jQuery DOM element in cache, grab it now
    if ($g_divTask === null) { $g_divTask = $("#divTask"); }
    return $g_divTask;
}


// Updates the Project div to reflect what the selected Project is
function UpdateDisplayWithSelectedProject(sProjectID, sProjectName)
{
    // Update the caption and data-projectid attribute of the Project div
    var $divProject = GetjQueryProjectDiv();
    $divProject.text(sProjectName);
    $divProject[0].setAttribute("data-projectid", sProjectID);
}


// Updates the Task div to reflect what the selected Task is
function UpdateDisplayWithSelectedTask(sTaskID, sTaskName)
{
    // Update the caption and data-projectid attribute of the Project div
    var $divTask = GetjQueryTaskDiv();
    $divTask.text(sTaskName);
    $divTask[0].setAttribute("data-taskid", sTaskID);
}


// Helper to get the Time Pane's Message div reference
function GetjQueryMessageDiv()
{
    // If we don't yet have the jQuery DOM element in cache, grab it now
    if ($g_divMessage === null) { $g_divMessage = $("#divMessage"); }
    return $g_divMessage;
}


// Clear any error message that might have been displayed
function ClearMessageArea()
{
    // Hide the message area
    GetjQueryMessageDiv().addClass("divHidden");
}

