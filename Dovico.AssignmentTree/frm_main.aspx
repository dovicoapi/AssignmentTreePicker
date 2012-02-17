<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="frm_main.aspx.cs" Inherits="Dovico.AssignmentTree.frm_main" %>
<!DOCTYPE html>
<html>
    <head>
        <title></title>
        <link href="css/jquery-ui-1.8.16.custom.css" rel="stylesheet" type="text/css" />
        <link href="css/assignmenttree.css" rel="stylesheet" type="text/css" />
        <link href="css/frm_main.css" rel="stylesheet" type="text/css" />
    </head>

    <body>
        <form id="form1" runat="server">

            <!-- The Project/Task Picker button -->
            <div class="divProjectTaskLabel">Project/Task Picker:</div>
            <button id="cmdProjectTaskContainer" type="button" title="Click to display the Project/Task picker" disabled="disabled">
                <div id="divProject" data-projectid="-1"></div>
                <div id="divTask" data-taskid="-1"></div>
            </button>

            <!-- The Project/Task Picker (jQuery will turn this into a floating div dialog) -->
            <div id="divProjectTaskPicker" style="display:none;">
                <div style="padding-top:6px;">
                    All Tasks: <div id="divTreePicker" class="TreeItemRootLoading"><img class="imgProcessing" src="images/transparent.gif" alt="Processing image" /> Processing...</div>
                </div>                            
            </div>


            <!-- This is where messages will be displayed (errors or informative) -->
            <div class="divMessageContainer">
                Error/Information:
                <div id="divMessage" runat="server"></div>
            </div>
            

            <script type="text/javascript">
                <% /* Rather than modify the Page_Load and inject JS, just grab the values directly */ %>
                var LOADING_MSG = "<%= LOADING_MSG %>";
            </script>

            <script src="js/jquery-1.6.2.min.js" type="text/javascript"></script>
            <script src="js/jquery-ui-1.8.16.custom.min.js" type="text/javascript"></script>
            <script src="js/commontree.js" type="text/javascript"></script>
            <script src="js/assignmenttree.js" type="text/javascript"></script>
            <script src="js/frm_main.js" type="text/javascript"></script>
        </form>
    </body>
</html>
