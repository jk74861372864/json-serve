
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

// tljs namespace.
(function( json_serve, $ ) {

	json_serve.total_results = 0;
	
	json_serve.current_page = 0;

	json_serve.results = null;
	
	json_serve.total_pages = function () {
		return parseInt(json_serve.total_results / 20);
	};

	json_serve.first_page = function () {
		json_serve.current_page = 0;

		json_serve.search();		
	};
	
	json_serve.previous_page = function () {
		if (json_serve.current_page > 0) {
			json_serve.current_page--;
		}

		json_serve.search();		
	};

	json_serve.next_page = function () {
		if (json_serve.current_page < json_serve.total_pages()) {
			json_serve.current_page++;
		}

		json_serve.search();		
	};

	json_serve.last_page = function () {
		json_serve.current_page = json_serve.total_pages();

		json_serve.search();		
	};
	
    json_serve.init = function () {
		$('#submit').click(json_serve.change_filter);

		$("form").submit(function (e) {
			e.preventDefault();

			json_serve.search();
		});

		$('#myModal').modal({
			keyboard: false,
			show: false
		})
						 
		json_serve.search();
    };

	json_serve.submit = function () {
		json_serve.current_page = 0;

		json_serve.search();
	};

	json_serve.search = function () {
		$('#results').html("loading...");
		
		var skip = json_serve.current_page * 20;

		var filter = $("#filter").val();

		var query = encodeURIComponent($("#query").val());
		
		var url = "/search?skip={0}&filter={1}&query={2}".format(
			skip,
			filter,
			query);
		
		var data = $.getJSON(url, json_serve.process_results).error(function () {
			alert ("Error no data returned.");
		});
	};

	json_serve.process_results = function (data) {
		json_serve.total_results = parseInt(data[0].n);

		if (json_serve.total_results === 0) {
			$('#results').html("No data found");

			return;
		}

		json_serve.results = data[1];
		
		var first_button = "<a class='btn btn-primary' href='#' role='button' id='first'>&laquo; First</a>";
		var previous_button = "<a class='btn btn-primary' href='#' role='button' id='previous'>&laquo; Previous</a>";
		var next_button = "<a class='btn btn-primary' href='#' role='button' id='next'>Next &raquo;</a>";
		var last_button = "<a class='btn btn-primary' href='#' role='button' id='last'>Last &raquo;</a>";
		
		var results = "<div class='row paging'><div class='col-xs-12'><p class='bs-component'>Showing page {0} of {1} ({2} results) {3} {4} {5} {6}</p></div></div>".format(
			json_serve.current_page + 1,
			json_serve.total_pages() + 1,
			json_serve.total_results,
			first_button,
			previous_button,
			next_button,
			last_button
		);
		
		results += "<div class='row'>";
		
		$.each( json_serve.results, function( key, val ) {
			if (key % 4 === 0) {
				results += "</div><div class='row'>";
			}			
			results += json_serve.build_result(val);			
		});

		results += "</div>"
		
		$('#results').html(results);

		$('#first').click(json_serve.first_page);
		$('#previous').click(json_serve.previous_page);
		$('#next').click(json_serve.next_page);
		$('#last').click(json_serve.last_page);
		$('.view').click(json_serve.view_result);
	};

	json_serve.build_result = function (data) {
		var result = "<div id='{0}' class='col-xs-12 col-sm-6 col-md-6 col-lg-3'><div class='well'>".format(data.id);
		result += "<h3>{0}</h3>".format(data.title);
		result += "<p>{0}</p>".format(data.medium);
		result += "<p><a class='btn btn-primary view' href='#' role='button'>View »</a></p>";
		result += "</div></div>";	
		return result;
	};

	json_serve.view_result = function () {

		var div = $(this).parent().parent().parent();

		$.each(json_serve.results, function (key, val) {
			if (val.id === div.attr('id')) {
				var title = val.title;
				
				$('.modal-title').html(title);

				var results = "<table class='table table-striped table-hover '>"
				results += "<thead>";
                results += "<tr>";
                results += "<th>Property</th>";
                results += "<th>Value</th>";
                results += "</tr>";
                results += "</thead>";
                results += "<tbody>";

				for (key in val) {
					if (val[key] !== "") {
						results += "  <tr>";
						results += "<td>{0}</td>".format(key);

						if (val[key] !== null && typeof val[key] === 'object') {
							var html = "";
							for (prop in val[key]) {
								html += val[key][prop] + ", ";
							}
							results += "<td>{0}</td></tr>".format(html);
						} else {
							results += "<td>{0}</td></tr>".format(val[key]);
						}
					}
				}

				results += "</tbody></table>";

				$('.modal-body').html(results);
				
				$('#myModal').modal('show');
			}
		});
		
	};
	
}( window.json_serve = window.json_serve || {}, jQuery));
