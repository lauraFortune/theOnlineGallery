/*####https://stackoverflow.com/questions/476679/preloading-images-with-jquery###*/
//===============================================================================================//
//                                                                                                                                                                                              //
//                                                        JQUERY ANIMATIONS                                                                                                         //     
//                                                                                                                                                                                              //
//===============================================================================================//

$(document).ready(function() { //animations happen on page load
    
    //CARD ANIMATIONS (profile.ejs, admin.ejs)
    $('#profileCard').animate({right: '17%'}, 1000);//slide profile card left
    $('#adminCard').animate({right: '17%'}, 1000); //slide admin card left

    //LANDING PAGE ANIMATION
    $('#image1').fadeIn(3000); //landing page image fade in
    $('#sideBar').fadeIn(500).animate({left: '5%'}, 2000); // side bar slides right
    $('#title').fadeIn(500).animate({left: '5%'}, 2000); //title font fades in and slides right
 
    //IMAGE ANIMATIONS
    $('#formImage').fadeIn().animate({marginTop: '-50px'}, 1000);
    $('#profileImage').fadeIn().animate({marginTop: '-260px'}, 1000);       
 
    // ON SCROLL ANIMATION - LANDING PAGE
    $(window).scroll( function(){

        $('.hideme').each( function(i){ /*#### start unhide on scroll ####*/
        var bottom_of_object = $(this).offset().top + $(this).outerHeight();
        var bottom_of_window = $(window).scrollTop() + $(window).height();
        
            if( bottom_of_window >  bottom_of_object ){
                $(this).animate({'opacity':'1'}, 3000);
            }
        }); 
    }); 

    //not used. perhaps to further develop the page if had more content
    $(window).scroll( function(){ //text slide animation
        $('.slideRight').each( function(i){
            var bottom_of_object = $(this).offset().top + $(this).outerHeight();
            var bottom_of_window = $(window).scrollTop() + $(window).height();
            
                if( bottom_of_window > bottom_of_object ){
                    $(this).animate({left: '55%'}, 3000);
                }
            });
            
        $('.slideLeft').each( function(i){ 
            var bottom_of_object = $(this).offset().top + $(this).outerHeight();
            var bottom_of_window = $(window).scrollTop() + $(window).height();
            
                if( bottom_of_window > bottom_of_object ){
                    $(this).animate({left: '17%'}, 3000);
                }
            }); 
        });
}); 

