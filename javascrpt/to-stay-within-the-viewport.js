<script>
        // document.addEventListener('DOMContentLoaded', function() {
        //     var subMenus = document.querySelectorAll('.menu-link.sub-menu-link');

        //     subMenus.forEach(function(subMenu) {
        //         subMenu.addEventListener('mouseover', function() {
        //             var subSubMenu = this.nextElementSibling; // Assuming the submenu follows the link
        //             if (subSubMenu) {
        //                 var subSubMenuRightEdge = subSubMenu.getBoundingClientRect().right;
        //                 var viewportWidth = window.innerWidth;

        //                 // Check if the submenu goes beyond the viewport's right edge
        //                 if (subSubMenuRightEdge > viewportWidth) {
        //                     // Add class to adjust submenu's position
        //                     subSubMenu.classList.add('sub-menu-left');
        //                 }
        //             }
        //         });
        //     });
        // });


        document.addEventListener('DOMContentLoaded', function () {
            // Target the parent menu items that have submenus
            var menuItemsWithChildren = document.querySelectorAll('.menu-item-has-children');

            menuItemsWithChildren.forEach(function (menuItem) {
                // When hovering over a menu item, check if the submenu goes offscreen
                menuItem.addEventListener('mouseover', function () {
                    var subMenu = menuItem.querySelector('.dropdown-menu');
                    if (subMenu) {
                        // Calculate the distance from the left edge of the submenu to the right edge of the viewport
                        var overflowAmount = subMenu.getBoundingClientRect().right - window.innerWidth;

                        // If the submenu overflows the viewport, adjust its position
                        if (overflowAmount > 0) {
                            subMenu.classList.add('sub-menu-left');
                        }
                    }

                });
            });
        });
</script>