using System;
using System.Web.Routing;

namespace Dovico.AssignmentTree
{
    public class Global : System.Web.HttpApplication
    {
        void Application_Start(object sender, EventArgs e)
        {
            // Set up the code required to handle URI rewriting
            RegisterRoutes(RouteTable.Routes);
        }
        

        /// <summary>
        /// Tells the System.Web.Routing.UrlRoutingModule what the routes (URI paths) are that are accepted by this service
        /// </summary>
        /// <param name="rcRoutes" type="RouteCollection" ref="true" inout="[in]" description="the route collection object that we're to use to register the URI routes"/>
        /// <returns>void</returns>
        /// <history>
        /// <modified author="C. Gerard Gallant" date="2012-02-14" reason="Created"/>
        /// </history>
        protected void RegisterRoutes(RouteCollection rcRoutes)
        {
            // Don't let the .ashx calls go through our routing table
            rcRoutes.Ignore("{handler}.ashx");


            // Configure our system to allow for URL Rewriting so that we don't have to use query strings
            rcRoutes.MapPageRoute("", "{sUserToken}", "~/frm_main.aspx");
        }
    }
}
