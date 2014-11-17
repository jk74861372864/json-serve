
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

// json_serve namespace.
(function( json_serve, $ ) {

    json_serve.total_results = 0;
    json_serve.current_page = 0;
    json_serve.results = null;

    json_serve.form_selector = "form";
    json_serve.submit_selector = "#submit";
    json_serve.filter_selector = "#filter";
    json_serve.query_selector = "#query";
    json_serve.results_selector = "#results";
    json_serve.modal_selector = "#modal";
    
    json_serve.init = function () {
        json_serve.bind_events();
        json_serve.init_modal();
        json_serve.search();
    };

    json_serve.bind_events = function () {
        $(json_serve.submit_selector).click(json_serve.change_filter);
        $(json_serve.form_selector).submit(json_serve.form_submit);
    };

    json_serve.bind_events_paging = function () {
        $('#first').click(json_serve.first_page);
        $('#previous').click(json_serve.previous_page);
        $('#next').click(json_serve.next_page);
        $('#last').click(json_serve.last_page);
        $('.view').click(json_serve.view_result);
    };

    json_serve.init_modal = function () {
        $(json_serve.modal_selector).modal({
            keyboard: true,
            show: false
        });
    };
    
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

    json_serve.form_submit = function (e) {
        e.preventDefault();

        json_serve.submit();
    };
    
    json_serve.submit = function () {
        json_serve.current_page = 0;

        json_serve.search();
    };

    json_serve.search = function () {
        $(json_serve.results_selector).html("loading...");
        
        var skip = json_serve.current_page * 20;
        var filter = $(json_serve.filter_selector).val();
        var query = $(json_serve.query_selector).val();
        
        var url = "/search?skip={0}&filter={1}&query={2}".format(
            encodeURIComponent(skip),
            encodeURIComponent(filter),
            encodeURIComponent(query));
        
        var data = $.getJSON(
            url,
            json_serve.process_results).error(
                json_serve.search_error);
    };

    json_serve.search_error = function () {
        alert ("Error fetching data");
    };

    json_serve.process_results = function (data) {
        json_serve.total_results = parseInt(data[0].n);

        // Validate we have results to process.
        if (json_serve.total_results === 0) {
            $(json_serve.results_selector).html("No data found");

            return;
        }

        json_serve.results = data[1];

        var html = json_serve.build_pagination();
        html += json_serve.build_results();
        
        // Insert html into dom
        $(json_serve.results_selector).html(html);

        // Bind events
        json_serve.bind_events_paging();
    };
    
    json_serve.build_pagination = function () {
        var data = {
            page: json_serve.current_page + 1,
            total_pages: json_serve.total_pages() + 1,
            total_results: json_serve.total_results
        };
        var template = $('#paging_template').html();
        var html = Mustache.to_html(template, data);
        return html;
    };

    json_serve.build_results = function () {
        // Build the individual results html
        var html = "";        
        $.each( json_serve.results, function( key, val ) {
            html += json_serve.build_result(val);            
        });

        // Build the results container html
        var data = {
            results: html
        };
        template = $('#results_template').html();
        html = Mustache.to_html(template, data);

        return html;
    };

    json_serve.build_result = function (data) {
        var template = $('#result_template').html();
        var html = Mustache.to_html(template, data);
        return html;
    };

    json_serve.view_result = function () {
        var div = $(this).parent().parent().parent();

        $.each(json_serve.results, function (key, val) {
            if (val.id === div.attr('id')) {
                json_serve.build_modal(val);
            }
        });
    };

    json_serve.build_modal = function (val) {
        var title = val.title;
        $(json_serve.modal_selector + ' .modal-title').html(title);

        var rows = "";
        for (key in val) {
            if (val[key] === "") {
                continue;
            }
            var data = {
                key: key,
                raw: val[key],
                value: json_serve.fetch_value
            };
            template = $('#modal_row_template').html();
            rows += Mustache.to_html(template, data);
        }

        var data = {
            rows: rows
        };
        template = $('#modal_template').html();
        html = Mustache.to_html(template, data);

        $(json_serve.modal_selector + ' .modal-body').html(html);
        $(json_serve.modal_selector).modal('show');
    }
    
    json_serve.fetch_value = function () {
        var fetch = function (value) {
            if (value !== null && typeof value === 'object') {
                var html = "";
                for (prop in value) {
                    if (value[prop] !== null && typeof value[prop] === 'object') {
                        html += fetch(value[prop]);
                    } else {
                        html += prop + ": " + value[prop] + ", ";
                    }
                }
                return html.substring(0, html.length - 2) + " ";
            } else {
                return value;
            }           
        };
        return fetch(this.raw);
    }
    
}( window.json_serve = window.json_serve || {}, jQuery));
