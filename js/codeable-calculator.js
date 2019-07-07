(function() {

	Number.prototype.formatMoney = function(c, d, t) {

		c = isNaN(c = Math.abs(c)) ? 2 : c;
		d = d == undefined ? "." : d;
		t = t == undefined ? "," : t;

		let n = this,
			s = n < 0 ? "-" : "",
			i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
			j = i.length;

		j = j > 3 ? j % 3 : 0;

		return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");

	};

	new Vue({
		el: '#calc',
		data: function() {

			return {
				hour_rate: 70,
				hours: 0,
				extra_percentage: 0,
				use_extra: false,
				is_new_client: true,
				fees: 0.175,
				total_hours: 0,
				total_hours_formatted: '',
				exta_hours: 0,
				amount: 0,
				client_amount: 0,
				client_fees: 0,
				expert_amount: 0,
				expert_fees: 0
			};

		},
		created: function() {

			var self = this;

			this.use_extra = true;
			this.hours = 1;
			this.extra_percentage = 35;

			chrome.storage.local.get( [ 'codeale_calc_inputs' ], function( result ) {

				if ( 'codeale_calc_inputs' in result ) {

					self.use_extra = result.codeale_calc_inputs.use_extra;
					self.hours = result.codeale_calc_inputs.hours;
					self.extra_percentage = result.codeale_calc_inputs.extra_percentage;
					self.hour_rate = result.codeale_calc_inputs.hour_rate;
					self.is_new_client = result.codeale_calc_inputs.is_new_client;

				}

			} );

		},
		updated: function() {

			chrome.storage.local.set( { codeale_calc_inputs: {
				hour_rate: this.hour_rate, 
				hours: this.hours, 
				use_extra: this.use_extra, 
				extra_percentage: this.extra_percentage,
				is_new_client: this.is_new_client
			} } );

		},
		watch: {
			extra_percentage: function(extra_percentage) {

				this.exta_hours = this.use_extra ? (extra_percentage / 100) : 0;

				this.calculate_amount();

			},
			use_extra: function(use_extra) {

				this.exta_hours = use_extra ? (this.extra_percentage / 100) : 0;

				this.calculate_amount();

			},
			is_new_client: function(is_new_client) {

				this.fees = is_new_client ? 0.175 : 0.15;

				this.calculate_amount();

			},
			hours: function() {

				this.calculate_amount();

			},
			hour_rate: function() {

				this.calculate_amount();

			}
		},
		methods: {
			select_all: function( e ) {
				
				e.target.select();

			},
			calculate_amount: function(amount) {

				amount = amount || this.amount;

				let base_hours = parseInt(this.hours);

				if (this.exta_hours > 0) {

					base_hours = (base_hours + (base_hours * this.exta_hours)).toPrecision(3);

				}

				const real_hours = Math.floor(base_hours),
					dicimals = base_hours - real_hours;

				this.total_hours = base_hours;
				this.total_hours_formatted = real_hours + ' Hours' + (dicimals ? ' ' + Math.round(dicimals * 60) + ' Minutes' : '');

				amount = Math.round(base_hours * this.hour_rate);

				this.client_amount = amount + (amount * this.fees);

				this.client_fees = amount * this.fees;

				this.expert_amount = amount - (amount * 0.10);

				this.expert_fees = amount * 0.10;

				this.amount = amount;

			}
		},
		filters: {
			money_format: function(value) {

				return '$' + value.formatMoney(0).toString();

			}
		}
	});
})();