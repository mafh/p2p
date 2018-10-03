'use strict';

var bvebBINs = ['447515', '414088', '446390', '446391', '424199', '412528', '676341', '671131', '544578', '544578', '547747', '545621'];

$(document).ready(function() {
	// var $form = $('form');
	// var $baloon = $('.js-baloon');

	var cardfromEl = document.getElementById('cardfrom');
	var cardtoEl = document.getElementById('cardto');

	var $cardfrom = $(cardfromEl);
	var $cardto = $(cardtoEl);

	var cardfrom = new Cleave(cardfromEl, {
		creditCard: true,
		creditCardStrictMode: true,
		onCreditCardTypeChanged: function(type) {
			cardfromEl.className = type;
		}
	});

	var cardto = new Cleave(cardtoEl, {
		creditCard: true,
		creditCardStrictMode: true,
		onCreditCardTypeChanged: function(type) {
			cardtoEl.className = type;
		}
	});

	var cvccvv = new Cleave('#cvccvv', {
		numeral: true,
		stripLeadingZeroes: false
	});

	var mmyy = new Cleave('#mmyy', {
		date: true,
		datePattern: ['m', 'y']
	});

	var amount = new Cleave('#amount', {
		numeral: true,
		numeralThousandsGroupStyle: 'none',
		numeralDecimalScale: 2,
		alwaysShowDecimals: true,
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
			}
		});

		selectCurrency.passedElement.addEventListener('change', function(event) {
			$selectCurrencyValue = event.detail.value;
			commissionCount();
		}, false);
	}

	$('#cardfrom, #cardto').on('input blur', commissionCount);
	$('#currency').on('change', commissionCount);
	$('#amount').on('input blur', commissionCount);

	// $form.on('submit', function(event) {
	// 	event.preventDefault();
	// 	$baloon.addClass('finish');
	// 	setTimeout(function(){
	// 		$form.trigger('submit');
	// 	},2000);
	// });

	function commissionCount() { //при потере фокуса со след. полей
		if (!$('#cardfrom').val() || !$('#cardto').val() || !$('#amount').val() || $('#cardfrom').val() == '0' || $('#cardto').val() == '0' || $('#amount').val() == '0') {
			$('#com').text('0,00'); // если хотя бы одно из полей пустое или равно 0, то комиссия = 0,00
		} else {
			var recieverBIN = $('#cardto').val().replace(/\s/g, '').slice(0, 6); //иначе получаем первые 6 цифр с обеих карточек
			var senderBIN = $('#cardfrom').val().replace(/\s/g, '').slice(0, 6);
			var tempValue = parseFloat($('#amount').val().replace(',', '.')); // значение поля "сумма"
			if (searchInBINs(bvebBINs, senderBIN)) {
				if (searchInBINs(bvebBINs, recieverBIN)) {
					$('#com').text(tarrifOther(tempValue, $selectCurrencyValue, false).toFixed(2).toString().replace('.', ','));
				} else {
					$('#com').text(tarrifOther(tempValue, $selectCurrencyValue, true).toFixed(2).toString().replace('.', ','));
				}
			} else {
				if (searchInBINs(bvebBINs, recieverBIN)) {
					$('#com').text('0,00');
				} else {
					console.log(tempValue, tarrifOther(tempValue, $selectCurrencyValue, true));
					$('#com').text(tarrifOther(tempValue, $selectCurrencyValue, true).toFixed(2).toString().replace('.', ','));
				}
			}
		}
	}

	svg4everybody({});
});

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
	return flag;
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}