(function ($) {
    
    /*
     * jQuery accessible and keyboard-enhanced navigation with dropdown
     * Website: http://a11y.nicolas-hoffmann.net/subnav-dropdown/
     * License MIT: https://github.com/nico3333fr/jquery-accessible-subnav-dropdown/blob/master/LICENSE
     */
 
    // Helper to show/hide submenu and setup appropriate attributes
    var toggleSubnav = function ($subnav, show) {
        if (!$subnav.length) return
        
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
    
    var getHorizontalMode = function ($item) {
        var y1 = $item.position().top, 
            y2 = NaN;
        if ($item.prev().length) {
            y2 = $item.prev().position().top;
        } else if ($item.next().length) {
            y2 = $item.next().position().top;
        }
        
        return y2 === y1 || isNaN(y2);
    };
    
    var gotoNextForItem = function ($item, next, focusSubnav) {
        var $next, $nextSubnav;
        
        // find next/prev
        if ($item.is(next ? "li:last-child" : "li:first-child")) {
            $next = $item
                .closest('ul')
                .find(next ? " > li:first-child > a" : " > li:last-child > a")
                .focus();
                
            if (focusSubnav) {
                var $nextSubnav = $next.next('ul');
                if ($nextSubnav.length === 1) {
                    $nextSubnav.find(" > li:first-child > a").focus();
                }
            }
        }
        // wrap around
        else {
            $next = (next ? $item.next() : $item.prev())
                .children("a")
                .focus();
                
            if (focusSubnav) {
                $nextSubnav = $next.next('ul');
                if ($nextSubnav.length === 1) {
                    $nextSubnav.find(" > li:first-child > a").focus();
                }
            }
        }
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
            $menu.on('mouseenter', 'li', function(event) {
                
                    var $this = $(this),
                        $subnav = $this.children('ul');

                    // show submenu
                    toggleSubnav($subnav, true);

                })
                .on('mouseleave', 'li', function(event) {
                    
                    var $this = $(this),
                        $subnav = $this.children('ul');

                    // hide submenu
                    toggleSubnav($subnav, false);

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
                        $subnav = $this.next('ul'),
                        $currentSubnav, $parentItem;
                        
                    var isHorizontal = getHorizontalMode($parent_item);
                    var prevCode = isHorizontal ? (rtl ? 39 : 37) : 38;
                    var nextCode = isHorizontal ? (rtl ? 37 : 39) : 40;
                    var inSubmenuCode = isHorizontal ? 40 : (rtl ? 37 : 39);
                    var outSubmenuCode = isHorizontal ? 38 : (rtl ? 39 : 37);
                    var shouldTryToMoveInParent = false;

                    // Keyboard in "previous" direction
                    if (event.keyCode === prevCode) {
                        gotoNextForItem($parent_item, false, false);
                        event.preventDefault();
                    }

                    // Keyboard in "next" direction
                    if (event.keyCode === nextCode) {
                        gotoNextForItem($parent_item, true, false);
                        event.preventDefault();
                    }

                    // Keyboard in "dive into submenu" direction
                    if (event.keyCode === inSubmenuCode) {
                        
                        if ($subnav.length === 1) {
                            // if submenu has been closed => reopen
                            toggleSubnav($subnav, true);

                            // and select first item
                            $subnav.find(" > li:first-child > a").focus();
                        }
                        else {
                            shouldTryToMoveInParent = true;
                        }
                        
                        event.preventDefault();
                    }
                    
                    // Escape, or arrow in "close submenu" direction
                    if (event.keyCode === 27 ||
                        event.keyCode === outSubmenuCode) {
                        shouldTryToMoveInParent = true;
                    }
                    
                    if (shouldTryToMoveInParent) {
                        $currentSubnav = $this.closest('ul');
                        $parentItem = $currentSubnav.closest('li');
                        
                        if (!$currentSubnav.length || !$menu.has($currentSubnav).length) {
                            $currentSubnav = $parentItem = null;
                        }
                        else if (!$parentItem.length || !$menu.has($parentItem).length) {
                            $parentItem = null;
                        }
                        
                        if ($currentSubnav) {
                            // Close this subnav and focus on parent item link
                            $currentSubnav.prev('a').focus();
                            toggleSubnav($currentSubnav, false);
                            event.preventDefault();
                        }
                        
                        if ($parentItem) {
                            // Try to navigate to prev/next in parent menu
                            var isParentHorizontal = getHorizontalMode($parentItem);
                            if (isParentHorizontal != isHorizontal) {
                                var parentPrevCode = isParentHorizontal ? (rtl ? 39 : 37) : 38;
                                var parentNextCode = isParentHorizontal ? (rtl ? 37 : 39) : 40;
                                                        
                                if (event.keyCode === parentPrevCode ||
                                    event.keyCode === parentNextCode) {

                                    gotoNextForItem($parentItem, event.keyCode === parentNextCode, true);
                                    event.preventDefault();
                                }
                            }
                        }
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

        });

    };

})(jQuery);
