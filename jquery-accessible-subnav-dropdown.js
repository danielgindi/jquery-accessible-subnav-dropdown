(function ($) {
    
    /*
     * jQuery accessible and keyboard-enhanced navigation with dropdown
     * Website: http://a11y.nicolas-hoffmann.net/subnav-dropdown/
     * License MIT: https://github.com/nico3333fr/jquery-accessible-subnav-dropdown/blob/master/LICENSE
     */
 
    // Helper to show/hide submenu and setup appropriate attributes
    var toggleSubnav = function ($subnav, show, timeout) {
        if (!$subnav.length) return;
        
        // Clear previous timeout
        if ($subnav.data('menu-hide-timeout-handle')) {
            clearTimeout($subnav.data('menu-hide-timeout-handle'));
            $subnav.removeData('menu-hide-timeout-handle');
        }
        
        // When hiding - we might want to use a slight delay.
        // This is because a possible gap between the parent menu and submenu,
        //   which will cause a "mouseleave" on the way to the submenu.
        if (!show && timeout) {
            // Set hide timeout
            var t = setTimeout(function () {
                toggleSubnav($subnav, show);
            }, timeout);
            $subnav.data('menu-hide-timeout-handle', t);
            return;
        }
        
        // Support both class and data selectors, user's choice...
        $subnav
            .toggleClass('sub-menu-hidden', !show) // "hidden" class for css selector
            .toggleClass('sub-menu-visible', !!show) // "visible" class for css selector
            .attr({
                'data-visually-hidden': !show // "hidden" data for css selector
            })
            .closest('li')
                .toggleClass('menu-item-show-sub', !!show) // "show-sub" class for css selector
                .attr({
                    'data-show-sub': show ? 'true' : 'false', // "show-sub" data for css selector
                    'aria-expanded': show ? 'true' : 'false' // Aria "expanded" attribute
                });
    };
    
    $.fn.accessibleMenu = function () {

        var $body = $(document.body);

        this.each(function () {

            var $menu = $(this);

            // Detect direction of menu (for left/right keys)
            var rtl = $menu.css('direction') === 'rtl';

            $menu.find('ul')
                // Initialize sub-menu-hidden for all sub menus
                .addClass('sub-menu-hidden')
                .removeClass('sub-menu-visible')
                // Initialize submenus "role" for accessibility
                .attr({
                    'role': 'menu'
                })
                // Initialize ARIA properties for submenus
                .closest('li').attr({
                    'aria-haspopup': 'true',
                    'aria-expanded': 'false'
                });
                
            // Initialize items' "role" for accessibility
            $menu.find('li').attr({ 'role': 'menuitem' });
            
            // Helper to handle focus moving between items, in nested menus
            var FOCUS_TIMEOUT = null;
            var checkFocusPosition = function () {
                if (!jQuery.contains($menu, document.activeElement)) {
                    //toggleSubnav($menu.find('.sub-menu-visible'), false);
                }
            };
            var scheduleFocusout = function () {
                if (FOCUS_TIMEOUT) return;
                FOCUS_TIMEOUT = setTimeout(function () {
                    checkFocusPosition();
                    FOCUS_TIMEOUT = null;
                }, 0);
            };
            var unscheduleFocusout = function () {
                if (!FOCUS_TIMEOUT) return;
                clearTimeout(FOCUS_TIMEOUT);
                FOCUS_TIMEOUT = null;
            };

            // Bind events for menu and items
            $menu.on('mouseenter', '>li', function(event) {
                
                    var $this = $(this),
                        $subnav = $this.children('ul');

                    // show submenu
                    toggleSubnav($subnav, true);

                })
                .on('mouseleave', '>li', function(event) {
                    
                    var $this = $(this),
                        $subnav = $this.children('ul');

                    // hide submenu
                    toggleSubnav($subnav, false, 100);

                })
                // keyboard
                .on('focus', 'li>a', function (event) {
                    
                    var $this = $(this),
                        $subnav = $this.next('ul');

                    // hide other menus
                    toggleSubnav($menu.find('ul').not($subnav).not($this.parentsUntil($menu, 'ul')), false);

                    // show submenu
                    toggleSubnav($subnav, true);
                    
                    unscheduleFocusout();
                })
                .on('focusout', 'li>a', function (event) {
                    scheduleFocusout();
                })
                .on('keydown', 'li>a', function (event) {
                    var $this = $(this),
                        $parent_item = $this.closest('li'),
                        $subnav = $this.next('ul');

                    // event keyboard left
                    if ((event.keyCode === 37 && !rtl) ||
                        (event.keyCode === 39 && rtl)) {
                        // select previous link

                        // if we are on first => activate last
                        if ($parent_item.is("li:first-child")) {
                            $parent_item
                                .closest('ul')
                                .find(" >li:last-child > a").focus();
                        }
                        // else activate previous
                        else {
                            $parent_item.prev().children("a").focus();
                        }
                        event.preventDefault();
                    }

                    // event keyboard right
                    if ((event.keyCode === 39 && !rtl) ||
                        (event.keyCode === 37 && rtl)) {
                        // select previous link

                        // if we are on last => activate first
                        if ($parent_item.is("li:last-child")) {
                            $parent_item
                                .closest('ul')
                                .find(" >li:first-child > a").focus();
                        }
                        // else activate next
                        else {
                            $parent_item.next().children("a").focus();
                        }
                        event.preventDefault();
                    }

                    // event keyboard bottom
                    if (event.keyCode == 40) {
                        // select first nav-system__subnav__link
                        if ($subnav.length === 1) {
                            // if submenu has been closed => reopen
                            toggleSubnav($subnav, true);

                            // and select first item
                            $subnav.find(" li:first-child > a").focus();
                        }
                        event.preventDefault();
                    }

                    // event shift + tab 
                    if (event.shiftKey && event.keyCode == 9) {
                        if ($parent_item.is("li:first-child")) {
                            toggleSubnav($subnav, false);
                        } else {

                            var $prev_nav_link = $parent_item.prev('li').children("a");
                            $subnav_prev = $prev_nav_link.next('ul');
                            if ($subnav_prev.length === 1) { // hide current subnav, show previous and select last element
                                toggleSubnav($subnav, false);
                                toggleSubnav($subnav_prev, true);
                                $subnav_prev.find(" li:last-child > a").focus();
                                event.preventDefault();
                            }
                        }
                    }

                });

            // Bind events for submenu items
            $menu.on('keydown', 'ul li > a', function (event) {
                    var $this = $(this),
                        $subnav = $this.closest('ul'),
                        $subnav_item = $this.closest('li'),
                        $nav_link = $subnav.prev('a'),
                        $nav_item = $nav_link.closest('li');

                    // event keyboard bottom
                    if (event.keyCode == 40) {
                        // if we are on last => activate first
                        if ($subnav_item.is("li:last-child")) {
                            $subnav.find("li:first-child > a").focus();
                        }
                        // else activate next
                        else {
                            $subnav_item.next().children("a").focus();
                        }
                        event.preventDefault();
                    }

                    // event keyboard top
                    if (event.keyCode == 38) {
                        // if we are on first => activate last
                        if ($subnav_item.is("li:first-child")) {
                            $subnav.find(" li:last-child > a").focus();
                        }
                        // else activate previous
                        else {
                            $subnav_item.prev().children("a").focus();
                        }
                        event.preventDefault();
                    }

                    // event keyboard Esc
                    if (event.keyCode == 27) {
                        // close the menu
                        $nav_link.focus();
                        toggleSubnav($subnav, false);
                        event.preventDefault();
                    }

                    // event keyboard right (next link)
                    if ((event.keyCode === 39 && !rtl) ||
                        (event.keyCode === 37 && rtl)) {
                            
                        // hide submenu
                        toggleSubnav($subnav, false);

                        // if we are on last => activate first and choose first item
                        if ($nav_item.is("li:last-child")) {
                            $next = $menu.find(" li:first-child > a");
                            $next.focus();
                            $subnav_next = $next.next('ul');
                            if ($subnav_next.length === 1) {
                                $subnav_next.find(" li:first-child > a").focus();
                            }
                        }
                        // else activate next
                        else {
                            $next = $nav_item.next().children("a");
                            $next.focus();
                            $subnav_next = $next.next('ul');
                            if ($subnav_next.length === 1) {
                                $subnav_next.find(" li:first-child > a").focus();
                            }
                        }
                        event.preventDefault();
                    }

                    // event keyboard left (prev link)
                    if ((event.keyCode === 37 && !rtl) ||
                        (event.keyCode === 39 && rtl)) {
                        
                        // hide submenu
                        toggleSubnav($subnav, false);

                        // if we are on first => activate last and choose first item
                        if ($nav_item.is("li:first-child")) {
                            $prev = $menu.find(" li:last-child > a");
                            $prev.focus();
                            $subnav_prev = $prev.next('ul');
                            if ($subnav_prev.length === 1) {
                                $subnav_prev.find("li:first-child > a").focus();
                            }
                        }
                        // else activate prev
                        else {
                            $prev = $nav_item.prev().children("a");
                            $prev.focus();
                            $subnav_prev = $prev.next('ul');
                            if ($subnav_prev.length === 1) {
                                $subnav_prev.find("li:first-child > a").focus();
                            }
                        }
                        event.preventDefault();
                    }

                    // event tab 
                    if (event.keyCode == 9 && !event.shiftKey) {
                        // if we are on last subnav of last item and we go forward
                        if ($nav_item.is("li:last-child") && $subnav_item.is("li:last-child")) {
                            // hide submenu
                            toggleSubnav($subnav, false);
                        }
                    }

                });

        });

    };

})(jQuery);
