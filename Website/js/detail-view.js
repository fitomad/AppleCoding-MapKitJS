function closeDetailView()
{
    element("information").style.visibility = "hidden";
}

function closeRoutePlanView()
{
    element("routePlan").style.visibility = "hidden";
}

/**
 * 
 * @param id 
 */
function element(id)
{
    return document.getElementById(id);
}