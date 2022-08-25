(function ($) {
  ("use strict");

	var windowOn = $(window);
	////////////////////////////////////////////////////
    // 01. PreLoader Js
	windowOn.on('load',function() {
		$("#loading").fadeOut(500);
	});
  
  // meanmenu
  $("#mobile-menu").meanmenu({
    meanMenuContainer: ".mobile-menu",
    meanScreenWidth: "991",
    meanExpand: ['<i class="far fa-angle-right"></i>'],
  });

    // meanmenu
    $("#mobile-menu-2").meanmenu({
      meanMenuContainer: ".mobile-menu-2",
      meanScreenWidth: "400000",
      meanExpand: ['<i class="far fa-angle-right"></i>'],
    });

  $(window).on("scroll", function () {
    var scroll = $(window).scrollTop();
    if (scroll < 245) {
      $("#header-sticky").removeClass("sticky");
    } else {
      $("#header-sticky").addClass("sticky");
    }
  });

  $(".search-toggle").on("click", function () {
		$(".search__area").addClass("search-active");
	});
	$(".search-close-btn").on("click", function () {
		$(".search__area").removeClass("search-active");
	});


  // nice select
  $(".shorting-select").niceSelect();
  //range slider activation

  $("#slider-range").slider({
    range: true,
    min: 0,
    max: 500,
    values: [75, 300],
    slide: function (event, ui) {
      $("#amount").val("$" + ui.values[0] + " - $" + ui.values[1]);
    },
  });

  // mainSlider
  function mainSlider() {
    var BasicSlider = $(".slider-active");
    BasicSlider.on("init", function (e, slick) {
      var $firstAnimatingElements = $(".single-slider:first-child").find(
        "[data-animation]"
      );
      doAnimations($firstAnimatingElements);
    });
    BasicSlider.on(
      "beforeChange",
      function (e, slick, currentSlide, nextSlide) {
        var $animatingElements = $(
          '.single-slider[data-slick-index="' + nextSlide + '"]'
        ).find("[data-animation]");
        doAnimations($animatingElements);
      }
    );
    BasicSlider.slick({
      autoplay: true,
      autoplaySpeed: 8000,
      dots: true,
      fade: true,
      arrows: false,
      prevArrow:
        '<button type="button" class="slick-prev"><i class="fal fa-angle-left"></i></button>',
      nextArrow:
        '<button type="button" class="slick-next"><i class="fal fa-angle-right"></i></button>',
      responsive: [
        {
          breakpoint: 767,
          settings: {
            dots: false,
            arrows: false,
          },
        },
      ],
    });

    function doAnimations(elements) {
      var animationEndEvents =
        "webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend";
      elements.each(function () {
        var $this = $(this);
        var $animationDelay = $this.data("delay");
        var $animationType = "animated " + $this.data("animation");
        $this.css({
          "animation-delay": $animationDelay,
          "-webkit-animation-delay": $animationDelay,
        });
        $this.addClass($animationType).one(animationEndEvents, function () {
          $this.removeClass($animationType);
        });
      });
    }
  }
  mainSlider();

  // owlCarousel
  $(".blog-active").owlCarousel({
    loop: true,
    margin: 30,
    items: 1,
    navText: [
      '<i class="fa fa-angle-left"></i>',
      '<i class="fa fa-angle-right"></i>',
    ],
    nav: false,
    dots: false,
    responsive: {
      0: {
        items: 1,
      },
      550: {
        items: 2,
      },
      900: {
        items: 3,
      },
      1200: {
        items: 3,
      },
      1600: {
        items: 4,
      },
    },
  });
  $(".blog-active-6").owlCarousel({
    loop: true,
    margin: 30,
    items: 1,
    navText: [
      '<i class="fa fa-angle-left"></i>',
      '<i class="fa fa-angle-right"></i>',
    ],
    nav: false,
    dots: false,
    responsive: {
      0: {
        items: 1,
      },
      576: {
        items: 1,
      },
      768: {
        items: 2,
      },
      992: {
        items: 2,
      },
      1200: {
        items: 3,
      },
      1600: {
        items: 3,
      },
    },
  });
  $(".top-selling-active").owlCarousel({
    loop: true,
    margin: 30,
    items: 4,
    navText: [
      '<i class="fa fa-angle-left"></i>',
      '<i class="fa fa-angle-right"></i>',
    ],
    nav: false,
    dots: false,
    responsive: {
      0: {
        items: 1,
      },
      550: {
        items: 2,
      },
      767: {
        items: 2,
      },
      900: {
        items: 3,
      },
      1200: {
        items: 4,
      },
      1600: {
        items: 4,
      },
    },
  });
  $(".top-selling-active-2").owlCarousel({
    loop: true,
    margin: 30,
    items: 5,
    navText: [
      '<i class="fa fa-angle-left"></i>',
      '<i class="fa fa-angle-right"></i>',
    ],
    nav: false,
    dots: true,
    responsive: {
      0: {
        items: 1,
      },
      550: {
        items: 2,
      },
      767: {
        items: 2,
      },
      900: {
        items: 3,
      },
      1200: {
        items: 4,
      },
      1600: {
        items: 5,
      },
    },
  });
  $(".trending-active").owlCarousel({
    loop: true,
    margin: 30,
    items: 5,
    navText: [
      '<i class="fa fa-angle-left"></i>',
      '<i class="fa fa-angle-right"></i>',
    ],
    nav: false,
    dots: true,
    responsive: {
      0: {
        items: 1,
      },
      550: {
        items: 2,
      },
      900: {
        items: 3,
      },
      1200: {
        items: 3,
      },
      1600: {
        items: 5,
      },
    },
  });
  $(".trending-active-2").owlCarousel({
    loop: true,
    margin: 30,
    items: 6,
    navText: [
      '<i class="fa fa-angle-left"></i>',
      '<i class="fa fa-angle-right"></i>',
    ],
    nav: false,
    dots: true,
    responsive: {
      0: {
        items: 1,
      },
      550: {
        items: 2,
      },
      900: {
        items: 3,
      },
      1200: {
        items: 3,
      },
      1400: {
        items: 5,
      },
      1600: {
        items: 6,
      },
    },
  });
  $(".trending-active-6").owlCarousel({
    loop: true,
    margin: 30,
    items: 6,
    navText: [
      '<i class="fa fa-angle-left"></i>',
      '<i class="fa fa-angle-right"></i>',
    ],
    nav: false,
    dots: true,
    responsive: {
      0: {
        items: 1,
      },
      550: {
        items: 2,
      },
      900: {
        items: 3,
      },
      1200: {
        items: 3,
      },
      1400: {
        items: 5,
      },
      1600: {
        items: 5,
      },
    },
  });
  $(".testimonial__slider").owlCarousel({
    loop: true,
    margin: 30,
    items: 6,
    navText: [
      '<i class="fa fa-angle-left"></i>',
      '<i class="fa fa-angle-right"></i>',
    ],
    nav: false,
    dots: true,
    responsive: {
      0: {
        items: 1,
      }
    },
  });

  $(".rc-post-thumb-slider").owlCarousel({
    loop: true,
    margin: 0,
    items: 6,
    navText: [
      '<button class="nav-left"><i class="far fa-angle-left"></i></button>', '<button class="nav-right"><i class="far fa-angle-right"></i></button>']
      ,
    nav: true,
    dots: false,
    responsive: {
      0: {
        items: 1,
      }
    },
  });

  $(".postbox__thumb-slider").owlCarousel({
    loop: true,
    margin: 0,
    items: 6,
    navText: [
      '<button class="nav-left"><i class="far fa-angle-left"></i></button>', '<button class="nav-right"><i class="far fa-angle-right"></i></button>']
      ,
    nav: true,
    dots: false,
    responsive: {
      0: {
        items: 1,
      }
    },
  });

  function homeSlider() {
    var slider = $('.lookbook-slider');
    slider.owlCarousel({
        loop: true,
        autoplay: true,
        nav: false,
        dots: true,
        navText: ['<i class="ti-arrow-left"></i>', '<i class="ti-arrow-right"></i>'],
        autoplayTimeout: 5000,
        responsive: {
            0: {
                items: 1
            },
            600: {
                items: 1
            },
            1000: {
                items: 1
            }
        }
    });
    slider.on('translate.owl.carousel', function () {
        var layer = $("[data-animation]");
        layer.each(function () {
            var slider_animation = $(this).data('animation');
            $(this).removeClass('animated ' + slider_animation).css('opacity', '0');
        });
    });
    $("[data-delay]").each(function () {
        var animation_delay = $(this).data('delay');
        $(this).css('animation-delay', animation_delay);
    });
    $("[data-duration]").each(function () {
        var animation_dutation = $(this).data('duration');
        $(this).css('animation-duration', animation_dutation);
    });
    slider.on('translated.owl.carousel', function () {
        var layer = slider.find('.owl-item.active').find("[data-animation]");
        layer.each(function () {
            var slider_animation = $(this).data('animation');
            $(this).addClass('animated ' + slider_animation).css('opacity', '1');
        });
    });
}
homeSlider();

  /* magnificPopup img view */
  $(".popup-image").magnificPopup({
    type: "image",
    gallery: {
      enabled: true,
    },
  });

  /* magnificPopup video view */
  $(".popup-video").magnificPopup({
    type: "iframe",
  });

  if (jQuery(".filter-wrapper").length > 0) {
    $(".filter-wrapper .filter-grid").imagesLoaded(function () {
      let $grid = $(".filter-wrapper .filter-grid").isotope({
        itemSelector: ".grid-item",
        percentPosition: true,
        layoutMode: "fitRows",
        masonry: {
          columnWidth: ".grid-item", // columnWidth: 1
        },
      });

      // filter items on button click
      $(".filter-nav").on("click", "button", function () {
        let filterValue = $(this).attr("data-filter");
        $grid.isotope({ filter: filterValue });
      });

      //for menu active class
      $(".filter-nav button").on("click", function (event) {
        $(this).siblings(".active").removeClass("active");
        $(this).addClass("active");
        event.preventDefault();
      });
    });
  }
  // filter items on button click
  $(".portfolio-menu").on("click", "button", function () {
    var filterValue = $(this).attr("data-filter");
    $grid.isotope({ filter: filterValue });
  });

  //for menu active class
  $(".portfolio-menu button").on("click", function (event) {
    $(this).siblings(".active").removeClass("active");
    $(this).addClass("active");
    event.preventDefault();
  });


    $('.grid').imagesLoaded( function() {
      // init Isotope
      var $grid = $('.grid').isotope({
        itemSelector: '.grid-item',
        percentPosition: true,
        masonry: {
        // use outer width of grid-sizer for columnWidth
        columnWidth: '.grid-item',
        }
      });
  
  
    // filter items on button click
    $('.masonary-menu').on( 'click', 'button', function() {
      var filterValue = $(this).attr('data-filter');
      $grid.isotope({ filter: filterValue });
    });
  
    //for menu active class
    $('.masonary-menu button').on('click', function(event) {
      $(this).siblings('.active').removeClass('active');
      $(this).addClass('active');
      event.preventDefault();
    });
  
    });



  // scrollToTop
  $.scrollUp({
    scrollName: "scrollUp", // Element ID
    topDistance: "300", // Distance from top before showing element (px)
    topSpeed: 300, // Speed back to top (ms)
    animation: "fade", // Fade, slide, none
    animationInSpeed: 200, // Animation in speed (ms)
    animationOutSpeed: 200, // Animation out speed (ms)
    scrollText:
      '<i class="fal fa-angle-double-right"></i><span>Back to top</span>', // Text for element
    activeOverlay: false, // Set CSS color to display scrollUp active point, e.g '#00FFFF'
  });

  // WOW active
  new WOW().init();

  // data background
  $("[data-background").each(function () {
    $(this).css(
      "background-image",
      "url(" + $(this).attr("data-background") + ") "
    );
  });
  // nice select
  $(".has-n-select select").niceSelect();
  // Parallax Stuff
  if ($(".stuff1").length) {
    var stuff = $(".stuff1").get(0);
    var parallaxInstance = new Parallax(stuff);
  }
  if ($(".stuff2").length) {
    var stuff = $(".stuff2").get(0);
    var parallaxInstance = new Parallax(stuff);
  }
  if ($(".stuff3").length) {
    var stuff = $(".stuff3").get(0);
    var parallaxInstance = new Parallax(stuff);
  }
  if ($(".stuff4").length) {
    var stuff = $(".stuff4").get(0);
    var parallaxInstance = new Parallax(stuff);
  }
  if ($(".stuff5").length) {
    var stuff = $(".stuff5").get(0);
    var parallaxInstance = new Parallax(stuff);
  }
  if ($(".stuff6").length) {
    var stuff = $(".stuff6").get(0);
    var parallaxInstance = new Parallax(stuff);
  }
  if ($(".stuff7").length) {
    var stuff = $(".stuff7").get(0);
    var parallaxInstance = new Parallax(stuff);
  }
  if ($(".stuff8").length) {
    var stuff = $(".stuff8").get(0);
    var parallaxInstance = new Parallax(stuff);
  }
  if ($(".stuff9").length) {
    var stuff = $(".stuff9").get(0);
    var parallaxInstance = new Parallax(stuff);
  }

  $("a.clickup").on("click", function (event) {
    if (this.hash !== "") {
      event.preventDefault();
      var hash = this.hash;
      $("html, body").animate(
        {
          scrollTop: $(hash).offset().top,
        },
        500,
        function () {
          window.location.hash = hash;
        }
      );
    }
  });

  	////////////////////////////////////////////////////
	// 21. Cart Plus Minus Js

	$(".cart-plus-minus").append('<div class="dec qtybutton">-</div><div class="inc qtybutton">+</div>');
	$(".qtybutton").on("click", function () {
		var $button = $(this);
		var oldValue = $button.parent().find("input").val();
		if ($button.text() == "+") {
			var newVal = parseFloat(oldValue) + 1;
		} else {
			// Don't allow decrementing below zero
			if (oldValue > 0) {
				var newVal = parseFloat(oldValue) - 1;
			} else {
				newVal = 0;
			}
		}
		$button.parent().find("input").val(newVal);
	});

  
    ////////////////////////////////////////////////////
    // 63. Data Countdown Js

    if (jQuery(".data-countdown").length > 0) {
      $('[data-countdown]').each(function() {
  
        var $this = $(this),
            finalDate = $(this).data('countdown');
  
        $this.countdown(finalDate, function(event) {
  
            $this.html(event.strftime('<span class="cdown days"><span class="time-count">%-D</span> <p>Days</p><span class="colon">:</span></span> <span class="cdown hour"><span class="time-count">%-H</span> <p>Hours</p><span class="colon">:</span></span> <span class="cdown minutes"><span class="time-count">%M</span> <p>Mins</p><span class="colon">:</span></span> <span class="cdown second"> <span><span class="time-count">%S</span> <p>Secs</p></span>'));
  
        });
  
    });
    }

  		////////////////////////////////////////////////////
    // 15. Data width Js
	$("[data-width]").each(function () {
		$(this).css("width", $(this).attr("data-width"));
	  });

	////////////////////////////////////////////////////
    // 07. Scroll To Top Js
    function smoothSctollTop() {
      $('.smooth-scroll').on('click', function (event) {
        var target = $(this.getAttribute('href'));
        if (target.length) {
          event.preventDefault();
          $('html, body').stop().animate({
            scrollTop: target.offset().top - 0
          }, 1500);
        }
      });
    }
    smoothSctollTop();

    ////////////////////////////////////////////////////
    // 21. Counter Js
    if (jQuery(".counter").length > 0) {
      $('.counter').counterUp({
        delay: 10,
        time: 1000
      });
    }

	////////////////////////////////////////////////////
	// 17. Show Login Toggle Js
	$('#showlogin').on('click', function () {
		$('#checkout-login').slideToggle(900);
	});

	////////////////////////////////////////////////////
	// 18. Show Coupon Toggle Js
	$('#showcoupon').on('click', function () {
		$('#checkout_coupon').slideToggle(900);
	});

	////////////////////////////////////////////////////
	// 19. Create An Account Toggle Js
	$('#cbox').on('click', function () {
		$('#cbox_info').slideToggle(900);
	});

	////////////////////////////////////////////////////
	// 20. Shipping Box Toggle Js
	$('#ship-box').on('click', function () {
		$('#ship-box-info').slideToggle(1000);
	});

  if (jQuery("#loading").length > 0){
    let cart = $('#cart'),
    soda = $('#soda'),
    meat = $('#meat'),
    image = $('#image'),
    mustard = $('#mustard'),
    path = [{x:-250, y:0}, {x:-100, y:-90}, {x:0, y:0}],
    path2 = [{x:250, y:0}, {x:150, y:-80}, {x:60, y:0}],
    path3 = [{x:-170, y:0}, {x:-80, y:-70}, {x:70, y:0}];
  
   
    
    var setupSequence = function() {
      let tl = new TimelineMax({repeat: -1, timeScale: 1.8});
      
      tl.set(mustard, {x:-250})
      .set(meat, {x:250})
      .set(soda, {x:-170})
      .to(cart, 2.1, { 
        x:750, 
        ease: SlowMo.ease.config(0.5, 0.5, false),
      })
      .to(mustard, 1, {
        bezier: {curviness: 0.3, values:path},
        opacity: 1,
        scale:1,
        ease: Back.easeOut.config(1.4)
      }, 0.5)
      .to(mustard, .2, {
        scale: 0,
      }, 0.8)
      .to(meat, 1, {
        bezier: {curviness: 0.3, values:path2},
        opacity: 1,
        scale:1,
        ease: Back.easeOut.config(1.4)
      }, 0.8)
      .to(meat, .2, {
        scale: 0
      }, 1.2)
      .to(soda, .7, {
        bezier: {curviness: 0.3, values:path3},
        opacity: 1,
        scale:1,
        ease: Back.easeOut.config(1.4)
      }, 1.2)
      .to(soda, .1, {
        scale: 0,
      },1.5);
    }
    
    setupSequence();
  }



})(jQuery);


