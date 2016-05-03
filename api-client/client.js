var config = require("./config.js")
var request = require("request");

var environment = {
  endpoint : process.argv[2] ? process.argv[2] : ONEOPS_ENDPOINT,
  org: '',
  authkey: process.argv[3] ? process.argv[3] : AUTH_TOKEN
}

module.exports.getInstances = function getInstances(orgname, assembly, platform, enviornment, component, callback) {
    environment.org = orgname
    var options = config.options(environment)
    options.uri += '/assemblies/' + assembly + '/operations/environments/' + enviornment + '/platforms/'
    + platform + '/components/' + component + '/instances.json?instances_state=all'

    var ids = []
    request(options, function(error, response, body) {
      var data = JSON.parse(body);
      for(var key in data) {
        ids.push(data[key].ciId)
      }
      callback (ids)
    });
  }


module.exports.getMonitorIds = function getMonitorIds(orgname, assembly, platform, enviornment, component, monitor, callback) {
    environment.org = orgname
    var options = config.options(environment)
    options.uri += '/assemblies/' + assembly + '/transition/environments/' + enviornment + '/platforms/' + platform
    + '/components/' + component + '/monitors.json'

    var ids = []
    request(options, function(error, response, body) {
      var data = JSON.parse(body);
      for(var key in data) {
        var name = data[key].ciName

        if(name && name.endsWith(monitor))
          ids.push(data[key].ciId)
      }
      callback (ids)
    });
  }

  module.exports.getMetricGraph = function getMetricGraph(orgname, assembly, platform, enviornment, component, instance, monitorId, callback) {
      environment.org = orgname
      var options = config.options(environment)
      options.uri += '/assemblies/' + assembly + '/operations/environments/' + enviornment + '/platforms/' + platform
      + '/components/' + component + '/instances/' + instance + '/monitors/' + monitorId + '.json'

      request(options, function(error, response, body) {
        var data = JSON.parse(body);
        var plotdata = {}
        for(var key in data) {//array of metric objects
          if(key == 'charts') {
            var obj = data[key]
            for(var o in obj) {
              var seriesdata = obj[o].data
              for(var s in seriesdata) {
                var sdata = seriesdata[s]
                var md = sdata.header.metric
                // plotdata.put(md,sdata.data)
                plotdata[md] = sdata.data
              }
            }
          }
        }
        callback(plotdata)
      });
    }

  module.exports.getAssemblyHealth = function getAssemblyHealth(orgname, assembly, callback) {
      environment.org = orgname
      var options = config.options(environment)
      options.uri += '/assemblies/' + assembly + '/instances.json?instances_state=all'

      var instances = {}
      request(options, function(error, response, body) {
        var data = JSON.parse(body);
        for(var key in data) {
          var state = data[key].opsState
          if(state in instances) {
              var vals = Number(instances[state]) + 1
              instances[state] = vals
          } else {
              instances[state] = 1
          }
        }
        callback(instances)
      });
    }

  module.exports.getEnvHealth = function getEnvHealth(orgname, assembly, env, callback) {
      environment.org = orgname
      var options = config.options(environment)
      options.uri += '/assemblies/' + assembly + '/operations/environments/' + env + '/instances.json?instances_state=all'

      var instances = {}
      request(options, function(error, response, body) {
        var data = JSON.parse(body);
        for(var key in data) {
          var state = data[key].opsState
          if(state in instances) {
              var vals = Number(instances[state]) + 1
              instances[state] = vals
          } else {
              instances[state] = 1
          }
        }
        callback(instances)
      });
    }

// getEnvHealth('stgqe', 'tomcat', 'lbtest2')
