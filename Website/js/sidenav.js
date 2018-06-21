
function openNavBar()
{
    element("Sidenav").style.width = "100%";
}

async function closeNavBar()
{
    element("Sidenav").style.width = "0%";
}

function presentSearch()
{
    var body = $("html, body");
    body.stop().animate({scrollTop:$(document).height() / 3}, 750, 'swing');

    closeNavBar();
}

/**
 * 
 * @param id 
 */
function element(id)
{
    return document.getElementById(id);
}