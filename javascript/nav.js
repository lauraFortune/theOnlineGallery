

$(document).ready(function() { /*Function to preload the background images as where causing error on load*/
    console.log("THE DOC SHOULD BE READY!!!");

    var images = ['nav_home.jpg', 'nav_gallery.jpg', 'nav_artists.jpg', 'nav_profile.jpg'];

    for (var i = 0; i < images.length; i++) {
        $('#contentIms').css('background-image', "url('" + images[i] + "')");
    }
    $('#contentIms').css('background-image', "url('" + images[0] + "')");

    /*## START NAV ##*/
    /*############## START NAV IMAGE HOVER EFFECT ################*/
    $("#one").hover(function(){
        console.log("HOVERING ON ONE");
        $('#contentIms').css('background-image', "url('nav_home.jpg')");
    });
      
    $("#two").hover(function(){
        $(" #contentIms").css("background-image", "url('nav_gallery.jpg')");
    });
     
    $("#three").hover(function(){
        $(" #contentIms").css("background-image", "url('nav_artists.jpg')");
    });
        
    $("#four").hover(function(){
        $(" #contentIms").css("background-image", "url('nav_profile.jpg')");
    });
    /*############## END NAV IMAGE HOVER EFFECT ################*/

    /*############## START OPEN & CLOSE NAV MENU ################*/
    var navOpen = false;
                
    $(".nav-icon").click(function(event){ 
        if (navOpen == false) {
            $('#contentList').fadeIn().animate({left: '50.1%'}, 1500);  //slide out content list
            $('#contentIms').delay(1500).fadeIn().animate({left: '45.1%'}, 1500); //slide out images
            navOpen = true;
            }   else {
                $('#contentIms').animate({left: '0'}, 1500).fadeOut(); //slide back images
                $('#contentList').delay(1500).animate({left: '0'}, 1500).fadeOut(); //slide back content list
                navOpen = false;
                }
    });
    /*############## END OPEN & CLOSE NAV MENU ################*/
    /*## ENDNAV ##*/
});