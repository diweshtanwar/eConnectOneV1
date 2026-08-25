;(function($) {
  'use strict';

  $.fn.menumaker = function(options) {
    const settings = $.extend({
      title: 'Menu',
      format: 'dropdown',
      breakpoint: 768,
      sticky: false
    }, options);

    return this.each(function() {
      const $menu = $(this);
      $menu.find('li ul').parent().addClass('has-sub');

      if (settings.format !== 'select') {
        $menu.prepend('<div id="menu-button" class="menu-button">' + settings.title + '</div>');

        $menu.find('#menu-button').on('click', function() {
          $(this).toggleClass('menu-opened');
          const mainmenu = $(this).next('ul');

          if (mainmenu.hasClass('open')) {
            mainmenu.hide().removeClass('open');
          } else {
            mainmenu.show().addClass('open');
            if (settings.format === 'dropdown') {
              mainmenu.find('ul').show();
            }
          }
        });

        const multiTg = function() {
          $menu.find('.has-sub').prepend('<span class="submenu-button"></span>');
          $menu.find('.submenu-button').on('click', function() {
            $(this).toggleClass('submenu-opened');
            const submenu = $(this).siblings('ul');

            if (submenu.hasClass('open')) {
              submenu.removeClass('open').hide();
            } else {
              submenu.addClass('open').show();
            }
          });
        };

        if (settings.format === 'multitoggle') {
          multiTg();
        } else {
          $menu.addClass('dropdown');
        }
      } else {
        $menu.append('<select style="width: 100%"></select>').addClass('select-list');
        const selectList = $menu.find('select');

        selectList.append($('<option>', {
          selected: 'selected',
          value: '',
          text: settings.title
        }));

        $menu.find('a').each(function() {
          const element = $(this);
          let indentation = '';

          for (let i = 1; i < element.parents('ul').length; i++) {
            indentation += '-';
          }

          selectList.append($('<option>', {
            value: element.attr('href'),
            text: indentation + element.text()
          }));
        });

        selectList.on('change', function() {
          const target = $(this).find('option:selected').val();
          if (target) {
            window.location.href = target;
          }
        });
      }

      if (settings.sticky === true) {
        $menu.css('position', 'fixed');
      }

      const resizeFix = function() {
        if ($(window).width() > settings.breakpoint) {
          $menu.find('ul').show();
          $menu.removeClass('small-screen');

          if (settings.format === 'select') {
            $menu.find('select').hide();
          } else {
            $menu.find('.menu-button').removeClass('menu-opened');
          }
        }

        if ($(window).width() <= settings.breakpoint && !$menu.hasClass('small-screen')) {
          $menu.find('ul').hide().removeClass('open');
          $menu.addClass('small-screen');

          if (settings.format === 'select') {
            $menu.find('select').show();
          }
        }
      };

      $(window).off('resize', resizeFix).on('resize', resizeFix);
      resizeFix();
    });
  };
})(jQuery);

$(function() {
  $('#navigation').menumaker({
    title: 'Menu',
    format: 'multitoggle'
  });

  $('#sub-nav').menumaker({
    title: 'subnav',
    format: 'multitoggle'
  });
});