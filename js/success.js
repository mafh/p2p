'use strict';

$(document).ready(function() {
	if ($('.js-to-email').length > 0) {
		successToEmail();
	}
	svg4everybody({});
});

function successToEmail() {
	var $wrap = $('.js-to-email');
	var $toggleWrap = $wrap.find('.to-email-toggle');
	var $toggle = $toggleWrap.find('a');
	var $form = $wrap.find('.to-email-form');

	$toggle.on('click', function(event) {
		event.preventDefault();
		$toggleWrap.slideUp(300);
		$form.slideDown(300)
	});
}