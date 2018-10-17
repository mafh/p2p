'use strict';

// var bvebBINsOld = [
// 	'447515',
// 	'414088',
// 	'446390',
// 	'446391',
// 	'424199',
// 	'412528',
// 	'676341',
// 	'671131',
// 	'544578',
// 	'544578',
// 	'547747',
// 	'545621'
// ];

var bvebBINs = [
	'676341',
	'544578',
	'545621',
	'414088',
	'447515',
	'446390',
	'446391',
	'424199',
	'911288',
	'671131',
];

var $form;

$(document).ready(function() {
	$form = $('form');

	var cardfromEl = document.getElementById('cardfrom');
	var cardtoEl = document.getElementById('cardto');
	var amountEl = document.getElementById('amount');

	var $cardfrom = $(cardfromEl);
	var $cardto = $(cardtoEl);
	var $amount = $(amountEl);
	var $com = $('#com');
	var $sendButton = $('#send_button');
	var $agree = $('#agree');
	var $order = $('#order');
	var $exp = $('#exp');
	var $exp_year = $('#exp_year');
	var $required = $('input[required]');
	var $comCurrency = $('#com_currency');
	var errormsg = cardfromEl.validationMessage;

	new Cleave(cardfromEl, {
		creditCard: true,
		creditCardStrictMode: true,
		onCreditCardTypeChanged: function(type) {
			cardfromEl.className = type;
		},
		onValueChanged: function(event) {
			var len = this.getRawValue().length;
			if (len < 13) {
				this.element.setCustomValidity(errormsg);
			} else {
				this.element.setCustomValidity('');
			}
		}
	});

	new Cleave(cardtoEl, {
		creditCard: true,
		creditCardStrictMode: true,
		onCreditCardTypeChanged: function(type) {
			cardtoEl.className = type;
		},
		onValueChanged: function(event) {
			var len = this.getRawValue().length;
			if (len < 13) {
				this.element.setCustomValidity(errormsg);
			} else {
				this.element.setCustomValidity('');
			}
		}
	});

	new Cleave('#cvccvv', {
		numeral: true,
		stripLeadingZeroes: false,
		onValueChanged: function(event) {
			var len = this.getRawValue().length;
			if (len < 3) {
				this.element.setCustomValidity(errormsg);
			} else {
				this.element.setCustomValidity('');
			}
		}
	});

	new Cleave('#mmyy', {
		date: true,
		datePattern: ['m', 'y'],
		onValueChanged: function(event) {
			var val = event.target.value.split('/');
			var len = this.getRawValue().length;

			$exp.val(val[0]);
			$exp_year.val(val[1]);

			if (len < 4) {
				this.element.setCustomValidity(errormsg);
			} else {
				this.element.setCustomValidity('');
			}
		}
	});

	var $selectCurrencyEl = $('[data-select-currency]')[0];

	var $selectCurrencyValue;

	if ($selectCurrencyEl !== undefined) {
		var selectCurrency = new Choices($selectCurrencyEl, {
			placeholder: false,
			placeholderValue: null,
			searchPlaceholderValue: null,
			searchEnabled: false,
			shouldSort: false,
			shouldSortItems: false,
			itemSelectText: '',

			callbackOnInit: function(event) {
				$selectCurrencyValue = this.element.value;
				$comCurrency.text($selectCurrencyValue);
			}
		});

		selectCurrency.passedElement.addEventListener('change', function(event) {
			$selectCurrencyValue = event.detail.value;
			$comCurrency.text($selectCurrencyValue);
			commissionCount();
		}, false);
	}

	$cardfrom.on('input blur', commissionCount);
	$cardto.on('input blur', commissionCount);
	$amount.on('input blur', commissionCount);

	new AutoNumeric('#amount', {
		digitGroupSeparator        : ' ',
		decimalCharacter           : ',',
		decimalCharacterAlternative: '.',
	});

	$agree.on('click', function() {
		if ($agree.prop('checked') === true) {
			$sendButton.prop('disabled', false)
		} else {
			$sendButton.prop('disabled', true);
		}
	});

	$sendButton.on('click', function(event) {
		if (checkInputs()) {
			$order.val('' + Date.now() + getRandomInt(1000, 9999));
			$cardfrom.val($cardfrom.val().replace(/\s/g, ''));
			$cardto.val($cardto.val().replace(/\s/g, ''));
			$amount.val($amount.val().replace(/\s/g, '').replace(',', '.'));
			$form.submit();
		}
	});

	function checkInputs() {
		var isValid = true;
		$.each($required, function(index, val) {
			var invalid = $(val).is(':invalid');

			if (invalid === true) {
				isValid = false;
				return false;
			}
		});
		return isValid;
	}

	function commissionCount() {
		console.log('commissionCount');
		if (!$cardfrom.val() || !$cardto.val() || !$amount.val() || $cardfrom.val() == '0'  || $cardto.val() == '0' || !$amount.val() === '0,00') {
			$com.text('0,00');
		} else {
			var recieverBIN = $cardto.val().replace(/\s/g, '').slice(0, 6);
			var senderBIN = $cardfrom.val().replace(/\s/g, '').slice(0, 6);
			var tempValue = $amount.val().replace(/\s/g, '').replace(',', '.');

			if (searchInBINs(bvebBINs, senderBIN)) {
				if (searchInBINs(bvebBINs, recieverBIN)) {
					$com.text(tarrifOther(tempValue, $selectCurrencyValue, false).toFixed(2).toString().replace('.', ','));
					selectOnlyBYN(false);
				} else {
					$com.text(tarrifOther(tempValue, $selectCurrencyValue, true).toFixed(2).toString().replace('.', ','));
					selectOnlyBYN(true);
				}
			} else {
				if (searchInBINs(bvebBINs, recieverBIN)) {
					$com.text('0,00');
				} else {
					$com.text(tarrifOther(tempValue, $selectCurrencyValue, true).toFixed(2).toString().replace('.', ','));
				}
				selectOnlyBYN(true);
			}
		}
	}

	if ($('.js-to-email').length > 0) {
		successToEmail();
	}

	svg4everybody({});
});

function selectOnlyBYN(bool) {
	console.log('selectOnlyBYN', bool);
}

//расчет комиссий в валюте
function tarrifOther(value, currency, otherBankReciever) {
	var comissionValue = value * ((currency === 'BYN' && otherBankReciever) ? 1.5 : 0.9) / 100;
	if (currency === 'BYN') {
		if (comissionValue < 0.49) {
			return 0.49;
		} else {
			return comissionValue;
		}
	} else {
		if (otherBankReciever) return 0;
		if (comissionValue < 0.25) {
			return 0.25;
		} else {
			return comissionValue;
		}
	}
}


//функция поиска карточки в словаре
function searchInBINs(array, elem) { //elem - первые 6 символов карточки
	var flag = false;
	for (var i = 0; i < array.length; i++) {
		if (array[i] === elem) {
			flag = true;
			break;
		}
	}
	// console.log(flag);
	return flag;
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function successToEmail() {
	var $wrap = $('.js-to-email');
	var $toggleWrap = $wrap.find('.to-email-toggle');
	var $toggle = $toggleWrap.find('a');
	var $form = $wrap.find('to-email-form');

	$toggle.on('click', function(event) {
		event.preventDefault();
		$toggleWrap.slideUp(300);
		$form.slideDown(300)
	});
}