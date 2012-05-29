/// <reference path="jquery-1.6.2.min.js" />
/// <reference path="jquery-ui-1.8.16.custom.min.js" />
/// <reference path="commontree.js" />


/// <summary>
///  Class that handles loading and displaying a client-side tree picker of the logged in user's assignments
///
///  NOTE: This class depends on a few functions in the common.js file
/// </summary>
/// <param name="sContainerID" type="string" ref="false" inout="in" description="the ID of the control that the HTML contents of this tree get added to" />
/// <param name="sClassInstanceName" type="string" ref="false" inout="in" description="the name of the variable for this class instance so that we can have click events call the proper class instance (there are other ways to accomplish this but this was the way I went for now)" />
/// <param name="sServerMethod" type="string" ref="false" inout="in" description="the name (or path if need be) for the server-side call (e.g. servermethod.ashx)" />
/// <param name="sUserToken" type="string" ref="false" inout="in" description="the user's token (needed by the server-side code for authentication)" />
/// <param name="fncOnItemSelected" type="function" ref="true" inout="in" description="the function to call when the user makes a selection (NOTE: the user can simply close the dialog which will keep the function from being called - don't just disable the form while waiting for a call back because it might not come)" />
function CAssignmentTree(sContainerID, sClassInstanceName, sServerMethod, sUserToken, fncOnItemSelected)
{
    //---------------------------------
    // Private variables/methods
    //---------------------------------
    var aThis = this; // Just in case we need a reference to the 'this' object in the future
    var m_sContainerID = sContainerID;
    var m_sClassInstanceName = sClassInstanceName;
    var m_fncOnItemSelected = fncOnItemSelected;

    // Some constants
    var TYPE_CLIENT = "C";
    var TYPE_PROJECT = "P";
    var TYPE_TASK = "T";
    
    // Variables that you can change if need be:
    var TRANSPARENT_GIF = "images/transparent.gif"; // Path to the Transparent gif
    var SERVERMETHOD_ASHX = sServerMethod; // The IHttpHandler that is to receive our server-side calls
    var USER_TOKEN = sUserToken; // The UserToken value to pass to the server code


    // Called automatically at the end of this class declaration to have the initial root items of the tree loaded
    var Initialize = function ()
    {
        // $("#ObjectsID") returns a jQuery object and *not* the DOM object itself. By doing a [0] it's the same as doing .get(0) to return the 
        // first object in the jQuery object (since we did a select via the ID, there should only ever be the one item returned)
        var objDOMParent = $(("#" + m_sContainerID))[0];

        // Fire off the request to the server-side code to have the list of root assignments added to the parent object
        RequestAssignments(objDOMParent, "AssignmentsGetRootAssignments", "");
    }


    // Helper that makes a request for assignments (NOTE: sAssignmentsURI is not needed if you are requesting Root Assignments)
    var RequestAssignments = function (objDOMParent, sAction, sAssignmentsURI)
    {
        // Build a JSON object containing the data needed for an Assignment GET request
        var aRequestDataObj = { UserToken: USER_TOKEN, Action: sAction, AssignmentsURI: sAssignmentsURI };

        // Execute the request passing the response data to the 'OnReceiveAssignments' function
        $.post(SERVERMETHOD_ASHX, aRequestDataObj, function (aData) { OnReceiveAssignments(aData, objDOMParent); });
    }


    // Called with the results of the $.post() call for the assignments list
    var OnReceiveAssignments = function (aData, objDOMParent)
    {
        // Grab the Next Page URI (if there is one)
        var sNextPageURI = $(aData).find("NextPageURI").text();

        // If the parent object currently indicates that we're processing then...
        var sClassName = objDOMParent.className;
        if ((sClassName === "TreeItemRootLoading") || (sClassName === "TreeItemChildrenLoading"))
        {
            // Change the class name and remove the 'Processing...' text
            objDOMParent.className = "TreeItemChildren";
            objDOMParent.innerHTML = "";
        } // End if ((sClassName === "TreeItemRootLoading") || (sClassName === "TreeItemChildrenLoading"))

        // Parse the returned data passing in the parent to append the data to and indicate if there is still more data to load based on if there
        // is a next page uri or not.
        ParseAssignmentXML(aData, objDOMParent, sNextPageURI);


        // If there is a next page of assignments then request the next set of child assignments
        if (sNextPageURI !== "N/A") { RequestAssignments(objDOMParent, "AssignmentsGetAssignmentsForURI", sNextPageURI); }
    }


    // Handles reading in each Assignment record and creating the tree item
    var ParseAssignmentXML = function (aData, objDOMParent, sNextPageURI)
    {
        var sAssignmentID = "", sType = "", sItemID = "", sName = "", sChildAssignmentsURI = "";
        var bRootLevel = (objDOMParent.id === m_sContainerID);
        var bHasChildren = false;

        // NOTE:    Additional values are available like StartDate, FinishDate, EstimatedHours, ETC, and Hide but they are not currently loaded 
        //          because this tool doesn't yet use them
        //
        // Loop through each Assignment node building up the HTML for this level of the tree
        $(aData).find("Assignment").each(function ()
        {
            // Grab the element values that we need from the current Assignment node
            sAssignmentID = $(this).find("AssignmentID").text();
            sItemID = $(this).find("ItemID").text();
            sName = EncodeHtml($(this).find("Name").text());
            sChildAssignmentsURI = $(this).find("GetAssignmentsURI").text();

            // Pull the Type from the AssignmentID value
            sType = sAssignmentID.substring(0, 1);
            
            // There are no children if there is no URI for the children. We also don't allow a tree item to be expanded past the Task level
            bHasChildren = !((sChildAssignmentsURI === "") || (sType === TYPE_TASK));


            // Build up the HTML needed for the current assignment row...
            //
            // - Root level assignment's will have the wrapper div with the class name 'TreeItemRoot'. The wrapper div's class name will simply 
            //   be 'TreeItem' for any other level down.
            //
            //   > There is a surrounding div for the Leaf, Type, and Name divs just so that when we're not dealing with a Task level item, 
            //     clicking anywhere on the row will trigger the expand/collapse of the row (rather than trying to hit a small target like the 
            //     leaf itself)
            //
            //     • The Leaf div's class name will either be 'TreeItemLeafCollapsed' (the [>] image) or 'TreeItemLeafNoChildren' (no image) 
            //       initially. When expanded, the leaf's class name will be 'TreeItemLeafExpanded' (the arrow poinging down a bit)
            //
            //     • The Item Type div will have one of the following class names: 'TreeItemTypeC', 'TreeItemTypeP', 'TreeItemTypeG', or
            //       'TreeItemTypeT' (Client, Project, Task Group, or Task respectively)
            //
            //     • The Name div will always contain the class name 'TreeItemName' but if we're dealing with a Task level assignment, the div
            //       will contain a second class name 'TreeItemNameSelectable'
            //
            //   > A div will be created the first time a branch is expaned that will hold the child assignment items of the current branch.
            //     While the content is being requested from the server-side code the div will have a class name of 'TreeItemChildrenLoading'. 
            //     Once the child assignments have been loaded, the class name will be changed to 'TreeItemChildren'
            //
            // We wrap our HTML string with $() to turn it into a jQuery object and then append the new jQuery object to parent object that was
            // passed into this function
            $(
                "<div class=\"TreeItem" + (bRootLevel ? "Root" : "") + "\">" +
                    "<div class=\"TreeItemLeafTypeNameContainer\" " + BuildItemLeafClickHandlerHTML(sAssignmentID, sType, sItemID, sName, bHasChildren, sChildAssignmentsURI) + "data-leafexpanded=\"" + DB_FALSE + "\" data-childrenloaded=\"" + DB_FALSE + "\">" +
                        "<div id=\"" + sAssignmentID + "-TreeItemLeaf\" class=\"TreeItemLeaf" + (bHasChildren ? "Collapsed" : "NoChildren") + "\" />" +
                        "<div class=\"TreeItemType" + sType + "\"" + BuildItemSelectionHandlerHTML(sType, sItemID, sName) + "/>" +
                        "<div class=\"TreeItemName" + (sType === TYPE_TASK ? " TreeItemNameSelectable" : "") + "\"" + BuildItemSelectionHandlerHTML(sType, sItemID, sName) + "><p>" + EncodeTextForElement(sName) + "</p></div>" +
                    "</div>" +
                "</div>"
            ).appendTo(objDOMParent);
        });
    }


    // Returns the 'onclick=\"javascript:....\"' value if the current item has children. Otherwise, returns "".
    var BuildItemLeafClickHandlerHTML = function (sAssignmentID, sType, sItemID, sName, bHasChildren, sChildAssignmentsURI)
    {
        // If the tree item has no children then it should not get a click event handler to expand/collapse the item
        if (!bHasChildren) { return ""; }

        // Build the OnClick event handler to have the current item expand/collapse (g_AssignmentTree is this class instance in frm_timer.js)
        return (" onclick=\"javascript:" + m_sClassInstanceName + ".OnClick_ItemLeaf(this,'" + sAssignmentID + "','" + sType + "','" + sItemID + "','" + sName + "','" + sChildAssignmentsURI + "');\" ");
    }


    // Only returns the 'onclick=\"javascript:....\"' value if we're dealing with a Task type. Returns "" for all other types.
    var BuildItemSelectionHandlerHTML = function (sType, sItemID, sName)
    {
        // If we are not dealing with a task-level assignment then return now (only task-level items should be selectable)
        if (sType !== TYPE_TASK) { return ""; }

        // Build the OnClick event handler that will be called when this item is selected
        return (" onclick=\"javascript:" + m_sClassInstanceName + ".OnClick_ItemSelected(this,'" + sItemID + "','" + sName + "');\" ");
    }

    
    // Helper that steps up through the tree looking for the Project and Client information belonging to the selected item
    var GetProjectAndClientInfoForSelectedItem = function (objSelectedItem, objReturnInfo)
    {
        var sID = "", sType = "";
        var objItem = objSelectedItem;

        // Loop from the selected item up the tree to find the Project and Client nodes...
        while (true)
        {
            // Grab the next parent TreeItemChildren node and then grab the node's ID
            objItem = GetTreeItemChildrenParentNode(objItem)
            sID = objItem.id;

            // If we've reached the top-most node in the tree then exit now
            if (sID === m_sContainerID) { break; }

            // Grab the node's type. If we're looking at a Project node then...
            sType = sID.substring(0, 1);
            if (sType === TYPE_PROJECT)
            {
                // Remember the Project ID and Name
                //
                // The ID is in the form 'P99-Children'. We want the portion following the first character up to the '-' character (the '99').
                // Break the string into two at the '-' character and then grab everything but the leading 'P' charcter from the first array item
                // to get the project id.
                var arrID = sID.split('-');
                objReturnInfo.ProjectID = arrID[0].substring(1);
                objReturnInfo.ProjectName = objItem.getAttribute("data-itemname");
            }
            else if (sType === TYPE_CLIENT) // If we're looking at a Client node then...
            {
                // Remember the Client ID and Name. 
                //
                // The ID is in the form 'C101-Children'. We want the portion following the first character up to the '-' character (the '101').
                // Break the string into two at the '-' character and then grab everything but the leading 'C' charcter from the first array item
                // to get the client id.
                var arrID = sID.split('-');
                objReturnInfo.ClientID = arrID[0].substring(1);
                objReturnInfo.ClientName = objItem.getAttribute("data-itemname");

                // Exit the loop since we can't go any higher (clients are our top-level items)
                break;
            } // End if
        } // End of the while (true) loop.
    }


    // Helper that grabs the first parent ChildrenParentNode item above the item passed in
    var GetTreeItemChildrenParentNode = function (objItem)
    {
        // Step up one parent at a time looking for the div with the class name 'TreeItemChildren'. Exit the loop if we found the node we're
        // looking for or if we ran out of parent nodes.
        var objParent = objItem.parentNode;
        while ((objParent != null) && (objParent.className !== "TreeItemChildren")) { objParent = objParent.parentNode; }
        return objParent;
    }



    //---------------------------------
    // Public variables/methods
    //---------------------------------

    // Click event handler for when the user expands/collapses a tree node/leaf (this function is not called for branches without children
    // because a click event is not set up for those branches)
    //
    // NOTE: sSelfName is already html encoded
    this.OnClick_ItemLeaf = function (objSelf, sSelfAssignmentID, sSelfType, sSelfItemID, sSelfName, sChildAssignmentsURI) {
        // Variables for values to be applied to objSelf (by default the values are set to so that we go to the expanded state)
        var sClassName = "TreeItemLeafExpanded";
        var sData_LeafExpanded = DB_TRUE;
        var sSelfChildrenID = (sSelfType + sSelfItemID + "-Children");
        var bExpandLeaf = true;
        var bLeafAlreadyExpanded = false;


        // If the current leaf is not yet expanded then...
        if (objSelf.getAttribute("data-leafexpanded") === DB_FALSE) {
            // If we have not yet loaded the children of this leaf then...
            if (objSelf.getAttribute("data-childrenloaded") === DB_FALSE) {
                // Flag that we have now loaded in the child data (so that we don't attempt to do so again) and that the leaf is expanded 
                // (objParent below is visible)
                objSelf.setAttribute("data-childrenloaded", DB_TRUE);
                bLeafAlreadyExpanded = true;

                // Create a div that will contain the child elements we're about to add. Turn the HTML into a jQuery object and append the new 
                // div as a child of the wrapper div that is being expanded.
                var $objParent = $("<div class=\"TreeItemChildrenLoading\" id=\"" + sSelfChildrenID + "\" data-itemname=\"" + sSelfName + "\"><img class=\"imgProcessing\" src=\"" + TRANSPARENT_GIF + "\" alt=\"Processing image\" /> Processing...</div>");
                $objParent.appendTo(objSelf.parentNode);

                // Request the child assignments to be loaded (pass the first item in the jQuery object, which is the DOM object itself, as the
                // 1st param)
                RequestAssignments($objParent[0], "AssignmentsGetAssignmentsForURI", sChildAssignmentsURI);
            } // End if(objSelf.getAttribute("data-childrenloaded") === DB_FALSE)
        }
        else // The leaf is currently expanded...
        {
            // Adjust the values to reflect that we are now collapsed
            sClassName = "TreeItemLeafCollapsed";
            sData_LeafExpanded = DB_FALSE;
            bExpandLeaf = false;
        } // End if (objSelf.getAttribute("data-leafexpanded") === DB_FALSE)


        // Get a reference to the child Leaf div. Remove the old class name and add on the new class name
        var $objLeaf = $(("#" + sSelfAssignmentID + "-TreeItemLeaf"));
        $objLeaf.removeClass((sClassName === "TreeItemLeafCollapsed" ? "TreeItemLeafExpanded" : "TreeItemLeafCollapsed"));
        $objLeaf.addClass(sClassName);

        // Adjust the data attribute of the current node to indicate if the leaf is expanded or not
        objSelf.setAttribute("data-leafexpanded", sData_LeafExpanded);


        // I want to give the user some feedback that they have successfully clicked on an item. We animate to a light blue and then animate
        // back to white.
        $(objSelf).animate({ "background-color": "#98bede" }, 100).animate({ "background-color": "#fff" }, 1000)


        // NOTE:    I was doing animations on the show/hide of branches too but it would mess up the scrolling of the div and occasionally bounce
        //          the user back to the top. As nice as the animations look, expected behaviour is better.        
        //
        // If we are to expand the branch and it is not already expanded then...
        if (bExpandLeaf && !bLeafAlreadyExpanded) {
            // Search the parent node of the current node for the Children div. Show the Children div
            $(("#" + sSelfChildrenID), objSelf.parentNode).show();
        }
        else if (!bExpandLeaf) // If we're to collapse the branch then...
        {
            // Search the parent node of the current node for the Children div. Hide the Children div
            $(("#" + sSelfChildrenID), objSelf.parentNode).hide();
        } // End if
    }


    // Click event handler for when the user selects a task in the tree
    this.OnClick_ItemSelected = function (objSelf, sItemID, sItemName) {
        // Change the style of this item to reflect that a selection has been made
        $(objSelf).addClass("TreeItemNameSelected");
        
        // Call the callback function to handle the rest of the processing (so that the selection is visible in the tree when the user makes the
        // selection)
        window.setTimeout(function () { CallBack_OnClick_ItemSelected(objSelf, sItemID, sItemName) }, MIN_SETTIMOUT);
    }
    var CallBack_OnClick_ItemSelected = function (objSelf, sItemID, sItemName)
    {      
        // Create a JSON object to hold the Client, Project, and Task information for the selected item and then get the Client/Project information
        // associated with the current item
        var objSelectionInfo = { ClientID: "0", ClientName: "[None]", ProjectID: "", ProjectName: "", TaskID: sItemID, TaskName: sItemName };
        GetProjectAndClientInfoForSelectedItem(objSelf, objSelectionInfo);

        // Pass the selection information to the following function (it will handle closing this dialog)
        m_fncOnItemSelected(objSelectionInfo);


        // We don't care about a success return value in this case so just call the function and continue on (server keeps track of the selected
        // assignment items so that all apps that use the core can stay in sync. allows us to reselect the last selected Client/Project/Task the 
        // next time the app is opened. will also give us the ability to display an MRU list for quick selection of a recently selected 
        // assignment item)
        $.post(SERVERMETHOD_ASHX, GetDataObjectForUpdateAssignmentMRU(objSelectionInfo));

        // Remove our item selection so that it doesn't show up selected the next time the user displays this form (everything will still be
        // expanded but at least they won't see multiple selected items from prevous selections). We use a timeout to 
        window.setTimeout(function () { $(objSelf).removeClass("TreeItemNameSelected") }, MIN_SETTIMOUT);
    }
    

    // Helper function that returns the data object needed by the server-side code to save the most recently selected Assignment information
    var GetDataObjectForUpdateAssignmentMRU = function (objAssignment) {
        // Return a JSON object containing the data needed for the Assignment MRU update request 
        return { 
            UserToken: USER_TOKEN,
            Action: "AssignmentsUpdateMRU",
            ClientID: objAssignment.ClientID,
            ClientName: objAssignment.ClientName,
            ProjectID: objAssignment.ProjectID,
            ProjectName: objAssignment.ProjectName,
            TaskID: objAssignment.TaskID,
            TaskName: objAssignment.TaskName
        };
    }


    // Call the Initialize function (can't call it until it has been defined which is why we wait until this point in the class)
    Initialize();
}
