// JavaScript used to power the Nextflow Report Template output.
window.data_byprocess = {};

function xround(n) {
  return Math.round(n*10)/10;
}

$(function() {

  // Script block clicked
  $('#tasks_table').on('click', '.script_block', function(e){
    e.preventDefault();
    $(this).toggleClass('short');
  });

  // Completed date from now
  var completed_date = moment( $('#workflow_complete').text(), "ddd MMM DD HH:mm:ss .* YYYY" );
  if(completed_date.isValid()){
    $('#completed_fromnow').html('completed ' + completed_date.fromNow() + ', ');
  }

  // Collect stats by process
  for(i=0; i<window.data['trace'].length; i++){
    var proc = window.data['trace'][i]['process']
    if(!window.data_byprocess.hasOwnProperty(proc)){
      window.data_byprocess[proc] = [];
    }
    window.data_byprocess[proc].push(window.data['trace'][i]);
  }

  // Plot histograms of resource usage
  var cpu_data = [];
  var pct_cpu_used_data = [];
  var mem_data = [];
  var pct_mem_used_data = [];
  var time_data = [];
  var pct_time_used_data = [];
  var readwrite_data = [];
  var time_alloc_hasdata = false;
  var readwrite_hasdata = false;
  for(var pname in window.data_byprocess){
    if (window.data_byprocess.hasOwnProperty(pname)) {
      var rc = [];
      var pc = [];
      var rm = [];
      var pm = [];
      var rt = [];
      var pt = [];
      var rd = [];
      for (var i = 0; i < window.data_byprocess[pname].length; i ++) {
        rc[i] = xround(parseInt(window.data_byprocess[pname][i]['%cpu']));
        pc[i] = xround((parseInt(window.data_byprocess[pname][i]['%cpu']) / (parseInt(window.data_byprocess[pname][i]['cpus']) * 100)) * 100);
        rm[i] = xround(parseInt(window.data_byprocess[pname][i]['vmem']) / 1000000000);
        pm[i] = xround((parseInt(window.data_byprocess[pname][i]['vmem']) / parseInt(window.data_byprocess[pname][i]['memory'])) * 100)
        rt[i] = xround(moment.duration( parseInt(window.data_byprocess[pname][i]['realtime']) ).asMinutes());
        pt[i] = xround((parseInt(window.data_byprocess[pname][i]['realtime']) / parseInt(window.data_byprocess[pname][i]['time'])) * 100)
        rd[i] = xround((parseInt(window.data_byprocess[pname][i]['read_bytes']) + parseInt(window.data_byprocess[pname][i]['write_bytes'])) / 1000000000);
        if (parseInt(window.data_byprocess[pname][i]['time']) > 0){ time_alloc_hasdata = true; }
        if (rd[i] > 0){ readwrite_hasdata = true; }
      }
      cpu_data.push({y: rc, name: pname, type:'box', boxpoints: 'all', jitter: 0.3});
      pct_cpu_used_data.push({y: pc, name: pname, type:'box', boxpoints: 'all', jitter: 0.3});
      mem_data.push({y: rm, name: pname, type:'box', boxpoints: 'all', jitter: 0.3});
      pct_mem_used_data.push({y: pm, name: pname, type:'box', boxpoints: 'all', jitter: 0.3});
      time_data.push({y: rt, name: pname, type:'box', boxpoints: 'all', jitter: 0.3});
      pct_time_used_data.push({y: pt, name: pname, type:'box', boxpoints: 'all', jitter: 0.3});
      readwrite_data.push({y: rd, name: pname, type:'box', boxpoints: 'all', jitter: 0.3});
    }
  }
  Plotly.newPlot('pctcpuplot', pct_cpu_used_data, { title: '% Requested CPU Used', yaxis: {title: '% Allocated CPUs Used', range: [0, 100]} });
  Plotly.newPlot('pctmemplot', pct_mem_used_data, { title: '% Requested Memory Used', yaxis: {title: '% Allocated Memory Used', range: [0, 100]} });
  if(time_alloc_hasdata){
    Plotly.newPlot('pcttimeplot', pct_time_used_data, { title: '% Requested Time Used', yaxis: {title: '% Allocated Time Used', range: [0, 100]} });
  } else {
    $('#timeplot_tabs, #timeplot_tabcontent').remove();
    $('#timeplot_header').after('<div id="timeplot"></div>');
    Plotly.newPlot('timeplot', time_data, { title: 'Task execution real-time', yaxis: {title: 'Execution time (minutes)'} });
  }
  if(readwrite_hasdata){
    Plotly.newPlot('readwriteplot', readwrite_data, { title: 'Disk Read+Write', yaxis: {title: 'Read bytes + write (gb)'} });
  } else {
    $('#readwriteplot_div').hide();
  }
  // Only plot tabbed plots when shown
  $('#cpuplot_tablink').on('shown.bs.tab', function (e) {
    if($('#cpuplot').is(':empty')){
      Plotly.newPlot('cpuplot', cpu_data, { title: 'CPU Usage', yaxis: {title: '% single core CPU usage'} });
    }
  });
  $('#memplotlot_tablink').on('shown.bs.tab', function (e) {
     if($('#memplot').is(':empty')){
       Plotly.newPlot('memplot', mem_data, { title: 'Memory Usage', yaxis: {title: 'Memory (gb)'} });
     }
  });
  $('#timeplot_tablink').on('shown.bs.tab', function (e) {
     if($('#timeplot').is(':empty')){
       Plotly.newPlot('timeplot', time_data, { title: 'Task execution real-time', yaxis: {title: 'Execution time (minutes)'} });
     }
  });

  // Humanize duration
  function humanize(duration){
    if (duration.days() > 0) {
      return duration.days() + "d " + duration.hours() + "h"
    }
    if (duration.hours() > 0) {
      return duration.hours() + "h " + duration.minutes() + "m"
    }
    if (duration.minutes() > 0) {
      return duration.minutes() + "m " + duration.seconds() + "s"
    }
    return duration.asSeconds().toFixed(1) + "s"
  }

  // Build the trace table
  function make_duration(ms){
    if($('#nf-table-humanreadable').val() == 'false'){
      return ms;
    }
    if (ms == '-' || ms == 0){
      return ms;
    }
    return humanize(moment.duration( parseInt(ms) ));
  }
  function make_date(ms){
    if($('#nf-table-humanreadable').val() == 'false'){
      return ms;
    }
    if (ms == '-' || ms == 0){
      return ms;
    }
    return moment( parseInt(ms) ).format();
  }
  function make_memory(bytes){
    if($('#nf-table-humanreadable').val() == 'false'){
      return bytes;
    }
    if (bytes == '-' || bytes == 0){
      return bytes;
    }
    // https://stackoverflow.com/a/14919494
    var thresh = 1000;
    if(Math.abs(bytes) < thresh) {
      return bytes + ' B';
    }
    var units = ['kB','MB','GB','TB','PB','EB','ZB','YB'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while(Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1)+' '+units[u];
  }
  function make_tasks_table(){
    // reset
      if ( $.fn.dataTable.isDataTable( '#tasks_table' ) ) {
        $('#tasks_table').DataTable().destroy();
      }
      var table = $('#tasks_table').DataTable({
        data: window.data.trace,
        columns: [
          { title: 'task_id', data: 'task_id' },
          { title: 'process', data: 'process' },
          { title: 'tag', data: 'tag' },
          { title: 'status', data: 'status', render: function(data, type, row){
              var s = {
                COMPLETED: 'success',
                CACHED: 'secondary',
                ABORTED: 'danger',
                FAILED: 'danger'
              }
              return '<span class="badge badge-'+s[data]+'">'+data+'</span>';
            }
          },
          { title: 'hash', data: 'hash', render:  function(data, type, row){
              var script = '';
              var lines = data.split("\n");
              var ws_re = /^(\s+)/g;
              var flws_match = ws_re.exec(lines[1]);
              if(flws_match == null){
                script = data;
              } else {
                for(var j=0; j<lines.length; j++){
                  script += lines[j].replace(new RegExp('^'+flws_match[1]), '').replace(/\s+$/,'') + "\n";
                }
              }
              return '<code>'+script+'</code>';
            }
          },
          { title: 'allocated cpus', data: 'cpus' },
          { title: '%cpu', data: '%cpu' },
          { title: 'allocated memory', data: 'memory', render: make_memory },
          { title: '%mem', data: '%mem' },
          { title: 'vmem', data: 'vmem', render: make_memory },
          { title: 'rss', data: 'rss', render: make_memory },
          { title: 'peak_vmem', data: 'peak_vmem', render: make_memory },
          { title: 'peak_rss', data: 'peak_rss', render: make_memory },
          { title: 'allocated time', data: 'time', render: make_duration },
          { title: 'duration', data: 'duration', render: make_duration },
          { title: 'realtime', data: 'realtime', render: make_duration },
          { title: 'script', data: 'script', render: function(data) {
              return '<pre class="script_block short"><code>' + data.trim() + '</code></pre>';
            }
          },
          { title: 'exit', data: 'exit' },
          { title: 'submit', data: 'submit', render: make_date },
          { title: 'start', data: 'start', render: make_date },
          { title: 'complete', data: 'complete', render: make_date },
          { title: 'rchar', data: 'rchar', render: make_memory },
          { title: 'wchar', data: 'wchar', render: make_memory },
          { title: 'syscr', data: 'syscr', render: make_memory },
          { title: 'syscw', data: 'syscw', render: make_memory },
          { title: 'read_bytes', data: 'read_bytes', render: make_memory },
          { title: 'write_bytes', data: 'write_bytes', render: make_memory },
          { title: 'native_id', data: 'native_id' },
          { title: 'name', data: 'name' },
          { title: 'module', data: 'module' },
          { title: 'container', data: 'container', render: function(data) {
              return '<samp>'+data+'</samp>';
            }
          },
          { title: 'disk', data: 'disk' },
          { title: 'attempt', data: 'attempt' },
          { title: 'scratch', data: 'scratch', render: function(data) {
              return '<samp>'+data+'</samp>';
            }
          },
          { title: 'workdir', data: 'workdir', render: function(data) {
              return '<samp>'+data+'</samp>';
            }
          }
        ],
        "deferRender": true,
        "lengthMenu": [[25, 50, 100, -1], [25, 50, 100, "All"]],
        "scrollX": true,
        "colReorder": true,
        "columnDefs": [
          { className: "id", "targets": [ 0,1,2,3 ] },
          { className: "meta", "targets": [ 4,13,16,17,18,19,20,27,28,29,30,31,32,33,34 ] },
          { className: "metrics", "targets": [ 5,6,7,8,9,10,11,12,14,15,21,22,23,24,25,26 ] }
        ],
        "buttons": [
          {
            extend: 'colvisGroup',
            text: 'Metrics',
            show: [ '.id', '.metrics' ],
            hide: [ '.meta' ],
          },
          {
            extend: 'colvisGroup',
            text: 'Metadata',
            show: [ '.id', '.meta'],
            hide: [ '.metrics' ],
          },
          {
            extend: 'colvisGroup',
            text: 'All',
            show: ':hidden',
          },
        ]
      });

      // Insert column filter button group
      table.buttons().container()
         .prependTo( $('#tasks_table_filter') );

      // Column filter button group onClick event to highlight active filter
      $('.buttons-colvisGroup').click(function(){
        var def = 'btn-secondary';
        var sel = 'btn-primary';
        $('.buttons-colvisGroup').removeClass(sel).addClass(def);
        $(this).addClass(sel).removeClass(def);
      });

      // Default filter highlight
      $(".buttons-colvisGroup:contains('All')").click();
    }

  // Dropdown changed about raw / human readable values in table
  $('#nf-table-humanreadable').change(function(){
    make_tasks_table();
  });
  // Make the table on page load
  make_tasks_table();

});
