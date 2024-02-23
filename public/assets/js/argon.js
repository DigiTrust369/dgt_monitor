
/*!

=========================================================
* Argon Dashboard - v1.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard
* Copyright 2020 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard/blob/master/LICENSE.md)

* Coded by www.creative-tim.com

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/



//
// Layout
//

'use strict';

var Layout = (function() {

    function pinSidenav() {
        $('.sidenav-toggler').addClass('active');
        $('.sidenav-toggler').data('action', 'sidenav-unpin');
        $('body').removeClass('g-sidenav-hidden').addClass('g-sidenav-show g-sidenav-pinned');
        $('body').append('<div class="backdrop d-xl-none" data-action="sidenav-unpin" data-target='+$('#sidenav-main').data('target')+' />');

        // Store the sidenav state in a cookie session
        Cookies.set('sidenav-state', 'pinned');
    }

    function unpinSidenav() {
        $('.sidenav-toggler').removeClass('active');
        $('.sidenav-toggler').data('action', 'sidenav-pin');
        $('body').removeClass('g-sidenav-pinned').addClass('g-sidenav-hidden');
        $('body').find('.backdrop').remove();

        // Store the sidenav state in a cookie session
        Cookies.set('sidenav-state', 'unpinned');
    }

    // Set sidenav state from cookie

    var $sidenavState = Cookies.get('sidenav-state') ? Cookies.get('sidenav-state') : 'pinned';

    if($(window).width() > 1200) {
        if($sidenavState == 'pinned') {
            pinSidenav()
        }

        if(Cookies.get('sidenav-state') == 'unpinned') {
            unpinSidenav()
        }

        $(window).resize(function() {
            if( $('body').hasClass('g-sidenav-show') && !$('body').hasClass('g-sidenav-pinned')) {
                $('body').removeClass('g-sidenav-show').addClass('g-sidenav-hidden');
            }
        })
    }

    if($(window).width() < 1200){
      $('body').removeClass('g-sidenav-hide').addClass('g-sidenav-hidden');
      $('body').removeClass('g-sidenav-show');
      $(window).resize(function() {
          if( $('body').hasClass('g-sidenav-show') && !$('body').hasClass('g-sidenav-pinned')) {
              $('body').removeClass('g-sidenav-show').addClass('g-sidenav-hidden');
          }
      })
    }



    $("body").on("click", "[data-action]", function(e) {

        e.preventDefault();

        var $this = $(this);
        var action = $this.data('action');
        var target = $this.data('target');


        // Manage actions

        switch (action) {
            case 'sidenav-pin':
                pinSidenav();
            break;

            case 'sidenav-unpin':
                unpinSidenav();
            break;

            case 'search-show':
                target = $this.data('target');
                $('body').removeClass('g-navbar-search-show').addClass('g-navbar-search-showing');

                setTimeout(function() {
                    $('body').removeClass('g-navbar-search-showing').addClass('g-navbar-search-show');
                }, 150);

                setTimeout(function() {
                    $('body').addClass('g-navbar-search-shown');
                }, 300)
            break;

            case 'search-close':
                target = $this.data('target');
                $('body').removeClass('g-navbar-search-shown');

                setTimeout(function() {
                    $('body').removeClass('g-navbar-search-show').addClass('g-navbar-search-hiding');
                }, 150);

                setTimeout(function() {
                    $('body').removeClass('g-navbar-search-hiding').addClass('g-navbar-search-hidden');
                }, 300);

                setTimeout(function() {
                    $('body').removeClass('g-navbar-search-hidden');
                }, 500);
            break;
        }
    })


    // Add sidenav modifier classes on mouse events

    $('.sidenav').on('mouseenter', function() {
        if(! $('body').hasClass('g-sidenav-pinned')) {
            $('body').removeClass('g-sidenav-hide').removeClass('g-sidenav-hidden').addClass('g-sidenav-show');
        }
    })

    $('.sidenav').on('mouseleave', function() {
        if(! $('body').hasClass('g-sidenav-pinned')) {
            $('body').removeClass('g-sidenav-show').addClass('g-sidenav-hide');

            setTimeout(function() {
                $('body').removeClass('g-sidenav-hide').addClass('g-sidenav-hidden');
            }, 300);
        }
    })


    // Make the body full screen size if it has not enough content inside
    $(window).on('load resize', function() {
        if($('body').height() < 800) {
            $('body').css('min-height', '100vh');
            $('#footer-main').addClass('footer-auto-bottom')
        }
    })

})();

//
// Navbar
//

'use strict';

var Navbar = (function() {

	// Variables

	var $nav = $('.navbar-nav, .navbar-nav .nav');
	var $collapse = $('.navbar .collapse');
	var $dropdown = $('.navbar .dropdown');

	// Methods

	function accordion($this) {
		$this.closest($nav).find($collapse).not($this).collapse('hide');
	}

    function closeDropdown($this) {
        var $dropdownMenu = $this.find('.dropdown-menu');

        $dropdownMenu.addClass('close');

    	setTimeout(function() {
    		$dropdownMenu.removeClass('close');
    	}, 200);
	}


	// Events

	$collapse.on({
		'show.bs.collapse': function() {
			accordion($(this));
		}
	})

	$dropdown.on({
		'hide.bs.dropdown': function() {
			closeDropdown($(this));
		}
	})

})();


//
// Navbar collapse
//


var NavbarCollapse = (function() {

	// Variables

	var $nav = $('.navbar-nav'),
		$collapse = $('.navbar .navbar-custom-collapse');


	// Methods

	function hideNavbarCollapse($this) {
		$this.addClass('collapsing-out');
	}

	function hiddenNavbarCollapse($this) {
		$this.removeClass('collapsing-out');
	}


	// Events

	if ($collapse.length) {
		$collapse.on({
			'hide.bs.collapse': function() {
				hideNavbarCollapse($collapse);
			}
		})

		$collapse.on({
			'hidden.bs.collapse': function() {
				hiddenNavbarCollapse($collapse);
			}
		})
	}

	var navbar_menu_visible = 0;

	$( ".sidenav-toggler" ).click(function() {
		if(navbar_menu_visible == 1){
		  $('body').removeClass('nav-open');
			navbar_menu_visible = 0;
			$('.bodyClick').remove();

		} else {

		var div = '<div class="bodyClick"></div>';
		$(div).appendTo('body').click(function() {
				 $('body').removeClass('nav-open');
					navbar_menu_visible = 0;
					$('.bodyClick').remove();

			 });

		 $('body').addClass('nav-open');
			navbar_menu_visible = 1;

		}

	});

})();

//
// Popover
//

'use strict';

var Popover = (function() {

	// Variables

	var $popover = $('[data-toggle="popover"]'),
		$popoverClass = '';


	// Methods

	function init($this) {
		if ($this.data('color')) {
			$popoverClass = 'popover-' + $this.data('color');
		}

		var options = {
			trigger: 'focus',
			template: '<div class="popover ' + $popoverClass + '" role="tooltip"><div class="arrow"></div><h3 class="popover-header"></h3><div class="popover-body"></div></div>'
		};

		$this.popover(options);
	}


	// Events

	if ($popover.length) {
		$popover.each(function() {
			init($(this));
		});
	}

})();

//
// Scroll to (anchor links)
//

'use strict';

var ScrollTo = (function() {

	//
	// Variables
	//

	var $scrollTo = $('.scroll-me, [data-scroll-to], .toc-entry a');


	//
	// Methods
	//

	function scrollTo($this) {
		var $el = $this.attr('href');
        var offset = $this.data('scroll-to-offset') ? $this.data('scroll-to-offset') : 0;
		var options = {
			scrollTop: $($el).offset().top - offset
		};

        // Animate scroll to the selected section
        $('html, body').stop(true, true).animate(options, 600);

        event.preventDefault();
	}


	//
	// Events
	//

	if ($scrollTo.length) {
		$scrollTo.on('click', function(event) {
			scrollTo($(this));
		});
	}

})();

//
// Tooltip
//

'use strict';

var Tooltip = (function() {

	// Variables

	var $tooltip = $('[data-toggle="tooltip"]');


	// Methods

	function init() {
		$tooltip.tooltip();
	}


	// Events

	if ($tooltip.length) {
		init();
	}

})();

//
// Form control
//

'use strict';

var FormControl = (function() {

	// Variables

	var $input = $('.form-control');


	// Methods

	function init($this) {
		$this.on('focus blur', function(e) {
        $(this).parents('.form-group').toggleClass('focused', (e.type === 'focus'));
    }).trigger('blur');
	}


	// Events

	if ($input.length) {
		init($input);
	}

})();


//
// View withdrawal prepare and create raw transaction
//
var fileSelected = function (input) {
  let formdata = new FormData();
  if (input.files.length > 0) {
    $("#rawButton").empty();
    $("#withdrawals tbody").empty();
    formdata.append("prepares", input.files[0]);
    jQuery.ajax({
      url: '/v1/transaction/create',
      type: "POST",
      data: formdata,
      processData: false,
      contentType: false,
      success: function (result) {
        let prepares = result.prepares.decrypted;
        let transactions = result.prepares.transactions;
        let raws = {
          meta         : prepares.meta,
          transactions : transactions
        };

        let infos = [];
        let name = input.files[0].name;
        name = name.split('.')[0] + name.split('.')[1] + ".raws.json";
        $("#rawButton").empty().append(`
          <a download="${name}" type="button" class="btn btn-primary btn-sm" href="data:application/octet-stream;charset=utf-8;base64,${btoa(JSON.stringify(raws))}">Get Raws</a><br/>
          `)

        let data = prepares.sources || [];
        for (let network in data) {
          for (let action of data[network]) {
            infos.push({
              network : network,
              id      : action.id,
              currency: action.currency,
              address : action.address,
              amount  : action.amount + " " + action.currency
            })
          }
        }

        infos.forEach(info => {
          $("#withdrawals tbody").append(`<tr>
            <th scope="row">
              <div class="media align-items-center">
                <a href="#" class="avatar rounded-circle mr-3">
                  <img alt="Image placeholder" src="./assets/img/theme/vue.jpg">
                </a>
                <div class="media-body">
                  <span class="name mb-0 text-sm">${info.network}</span>
                </div>
              </div>
            </th>
            <td class="budget">
              ${info.currency}
            </td>
            <td>
              <span class="badge badge-dot mr-4">
                <i class="bg-warning"></i>
                <span class="status">#${info.id}</span>
              </span>
            </td>
            <td>
              <div class="avatar-group">
                ${info.address}
              </div>
            </td>
            <td>
              <div class="d-flex align-items-center">
                <span class="completion mr-2">${info.amount}</span>
              </div>
            </td>
          </tr>`);
        })
      },
      error: function (request, status, error) {
        alert(`Decrypt file error. View console for more details`);
        console.log(request)
        console.log(status)
        console.log(error)
      }
    })
  }
}

//
// View raw transactions
//
var rawFileSelected = function (input) {
  if (input.files.length > 0) {
    let file = input.files[0];
    $("#transactions tbody").empty();
    let reader = new FileReader();
    reader.onload = function(event) {
      let content = JSON.parse(event.target.result);
      for (let network in content.transactions) {
        if (network == 'ethereum') {
          $("#warning").text(`Note: ${content.transactions[network].length} ethereum transactions, estimate time: ${content.transactions[network].length*20}s`);
        }

        content.transactions[network].forEach((transaction) => {
          let ids = transaction.reports.map(t => t.id);
          $("#transactions tbody").append(`<tr>
            <th scope="row">
              <div class="media align-items-center">
                <a href="#" class="avatar rounded-circle mr-3">
                  <img alt="Image placeholder" src="./assets/img/theme/vue.jpg">
                </a>
                <div class="media-body">
                  <span class="name mb-0 text-sm">${network}</span>
                </div>
              </div>
            </th>
            <td>
              <span class="badge badge-dot mr-4">
                <i class="bg-warning"></i>
                <span class="status">#${ids}</span>
              </span>
            </td>
            <td>
              <span class="badge badge-dot mr-4">
                <span class="status">#${transaction.txId}</span>
              </span>
            </td>
            <td>
              <div class="avatar-group">
              </div>
            </td>
            <td>
              <div class="d-flex align-items-center">
                <span class="completion mr-2"></span>
              </div>
            </td>
          </tr>`);
        });
      }
    };

    reader.readAsText(file);
  }
}


//
// Send raw transactions
//
var sendRawTransactions = function () {
  let formdata = new FormData();
  let input = document.getElementById ("file");
  if (input.files.length > 0) {
    $("#warning").text("Sending ...");
    let file = input.files[0];
    formdata.append("raws", file);
    jQuery.ajax({
      url: '/v1/transaction/send',
      type: "POST",
      data: formdata,
      processData: false,
      contentType: false,
      timeout: 3000000,
      success: function (result) {
        $("#warning").text("");
        $("#transactions tbody").empty();
        let status = result.raws.status;
        for (let network in status) {
          status[network].forEach((transaction) => {
            let ids = transaction.reports.map(t => t.id);
            $("#transactions tbody").append(`<tr>
              <th scope="row">
                <div class="media align-items-center">
                  <a href="#" class="avatar rounded-circle mr-3">
                    <img alt="Image placeholder" src="./assets/img/theme/vue.jpg">
                  </a>
                  <div class="media-body">
                    <span class="name mb-0 text-sm">${network}</span>
                  </div>
                </div>
              </th>
              <td>
                <span class="badge badge-dot mr-4">
                  <i class="bg-warning"></i>
                  <span class="status">#${ids}</span>
                </span>
              </td>
              <td>
                <span class="badge badge-dot mr-4">
                  <span class="status">${transaction.txId}</span>
                </span>
              </td>
              <td>
                <div class="avatar-group">
                  ${transaction.status}
                </div>
              </td>
              <td>
                <div class="d-flex align-items-center">
                  <span class="completion mr-2">${transaction.message || ''}</span>
                </div>
              </td>
            </tr>`);
          });
        }
      },
      error: function (request, status, error) {
        alert(`Send raw transactions error. View console for more details`);
        console.log(request)
        console.log(status)
        console.log(error)
      }
    })
  }
}


//
// Monitor network
//
var monitorsBlockchain = function () {
  setInterval(() => {
    $.ajax({
      url: "/v1/monitor/reports",
      type: 'GET',
      dataType: 'json', // added data type
      success: function(res) {
        if (Object.keys(res).length <= 0) return;
        $("#monitors").empty();
        for (let network in res) {
          let data = res[network];
          $("#monitors").append(`<div class="col-xl-3 col-md-6"><div class="card card-stats"><div class="card-body">
            <div class="row">
              <div class="col">
                <h5 class="card-title text-uppercase text-muted mb-0">${data.network} Head Block</h5>
                <span class="h2 font-weight-bold mb-0">${data.head}</span>
                <span class="h6 text-nowrap"><i>@ ${data.time}</i></span>
              </div>
              <div class="col-auto">
                <div class="icon icon-shape bg-gradient-green text-white rounded-circle shadow">
                  <i class="ni ni-money-coins"></i>
                </div>
              </div>
            </div>
            <p class="mt-3 mb-0 text-sm">
              <span class="text-success"><i class="ni ni-bold-up"></i><b> ${data.processed}</b></span>
              <span class="text-nowrap">Processed Block</span>
              <span class="h6 text-nowrap">IP: ${data.node}</span>
            </p>
          </div></div></div>`)
        }
      }
    });
  }, 2000);
}
