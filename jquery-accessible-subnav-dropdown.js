(function ($) {
    
    /*
     * jQuery accessible and keyboard-enhanced navigation with dropdown
     * Website: http://a11y.nicolas-hoffmann.net/subnav-dropdown/
     * License MIT: https://github.com/nico3333fr/jquery-accessible-subnav-dropdown/blob/master/LICENSE
     */
 
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

            // Bind events for menu and items
            $menu.on('mouseenter', '>li', function(event) {
                    var $this = $(this),
                        $subnav_link = $this.children('a'),
                        $subnav = $this.children('ul');

                    $this.attr({
                        'data-show-sub': 'true'
                    });

                    // show submenu
                    if ($subnav.length === 1) {
                        $subnav
                            .removeClass('sub-menu-hidden')
                            .addClass('sub-menu-visible')
                            .closest('li').attr({ 'aria-expanded': 'true' });
                    }

                })
                .on('mouseleave', '>li', function(event) {
                    var $this = $(this),
                        $subnav_link = $this.children('a'),
                        $subnav = $this.children('ul');

                    $this.attr({
                        'data-show-sub': 'false'
                    });
                    // show submenu
                    if ($subnav.length === 1) {
                        $subnav
                            .addClass('sub-menu-hidden')
                            .removeClass('sub-menu-visible')
                            .closest('li').attr({ 'aria-expanded': 'false' });
                    }

                })
                // keyboard
                .on('focus', '>li>a', function (event) {
                    var $this = $(this),
                        $parent_item = $this.closest('li'),
                        $subnav = $this.next('ul');

                    $parent_item.attr({
                        'data-show-sub': 'true'
                    });

                    // hide other menus and show submenu activated
                    $menu.find('ul')
                        .addClass('sub-menu-hidden')
                        .removeClass('sub-menu-visible')
                        .closest('li').attr({ 'aria-expanded': 'false' });

                    if ($subnav.length === 1) {
                        $subnav
                            .removeClass('sub-menu-hidden')
                            .addClass('sub-menu-visible')
                            .closest('li').attr({ 'aria-expanded': 'true' });
                    }

                })
                .on('focusout', '>li>a', function (event) {
                    var $this = $(this),
                        $parent_item = $this.closest('li');

                    $parent_item.attr({
                        'data-show-sub': 'false'
                    });
                })
                .on('keydown', '>li>a', function (event) {
                    var $this = $(this),
                        $parent_item = $this.closest('li'),
                        $subnav = $this.next('ul');

                    // event keyboard left
                    if ((event.keyCode === 37 && !rtl) ||
                        (event.keyCode === 39 && rtl)) {
                        // select previous link

                        // if we are on first => activate last
                        if ($parent_item.is("li:first-child")) {
                            $menu.find(" >li:last-child > a").focus();
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
                            $menu.find(" li:first-child > a").focus();
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
                            $subnav
                                .removeClass('sub-menu-hidden')
                                .addClass('sub-menu-visible')
                                .closest('li').attr({ 'aria-expanded': 'true' });

                            // and select first item
                            $subnav.find(" li:first-child > a").focus();
                        }
                        event.preventDefault();
                    }

                    // event shift + tab 
                    if (event.shiftKey && event.keyCode == 9) {
                        if ($parent_item.is("li:first-child")) {
                            $subnav
                                .addClass('sub-menu-hidden')
                                .removeClass('sub-menu-visible')
                                .closest('li').attr({ 'aria-expanded': 'false' });
                        } else {

                            var $prev_nav_link = $parent_item.prev('li').children("a");
                            $subnav_prev = $prev_nav_link.next('ul');
                            if ($subnav_prev.length === 1) { // hide current subnav, show previous and select last element
                                $subnav
                                    .addClass('sub-menu-hidden')
                                    .removeClass('sub-menu-visible')
                                    .closest('li').attr({ 'aria-expanded': 'false' });

                                $subnav_prev
                                    .removeClass('sub-menu-hidden')
                                    .addClass('sub-menu-visible')
                                    .closest('li').attr({ 'aria-expanded': 'true' });
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
                        $subnav
                            .addClass('sub-menu-hidden')
                            .removeClass('sub-menu-visible')
                            .closest('li').attr({ 'aria-expanded': 'false' });
                        event.preventDefault();
                    }

                    // event keyboard right
                    if ((event.keyCode === 39 && !rtl) ||
                        (event.keyCode === 37 && rtl)) {
                        // select next link
                        $subnav
                            .addClass('sub-menu-hidden')
                            .removeClass('sub-menu-visible')
                            .closest('li').attr({ 'aria-expanded': 'false' });

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

                    // event keyboard left
                    if ((event.keyCode === 37 && !rtl) ||
                        (event.keyCode === 39 && rtl)) {
                        // select prev link
                        $subnav
                            .addClass('sub-menu-hidden')
                            .removeClass('sub-menu-visible')
                            .closest('li').attr({ 'aria-expanded': 'false' });

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
                    if (event.keyCode == 9 && !event.shiftKey) { // if we are on last subnav of last item and we go forward => hide subnav 
                        if ($nav_item.is("li:last-child") && $subnav_item.is("li:last-child")) {
                            $subnav
                                .addClass('sub-menu-hidden')
                                .removeClass('sub-menu-visible')
                                .closest('li').attr({ 'aria-expanded': 'false' });
                        }
                    }

                })
                .on('focus', 'ul li > a', function (event) {
                    var $this = $(this),
                        $subnav = $this.closest('ul'),
                        $subnav_item = $this.closest('li'),
                        $nav_link = $subnav.prev('a'),
                        $nav_item = $nav_link.closest('li');

                    $nav_item.attr({
                        'data-show-sub': 'true'
                    });
                })
                .on('focusout', 'ul li > a', function (event) {
                    var $this = $(this),
                        $subnav = $this.closest('ul'),
                        $subnav_item = $this.closest('li'),
                        $nav_link = $subnav.prev('a'),
                        $nav_item = $nav_link.closest('li');

                    $nav_item.attr({
                        'data-show-sub': 'false'
                    });
                });

        });

    };

})(jQuery);
