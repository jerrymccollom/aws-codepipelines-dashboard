let PipelineService = function (jquery) {

    let getPipelines = function (responseHandler) {
            jquery.ajax({
                dataType: "json",
                url: "/pipelines",
                success: function (response) {
                    const listOfPipelineNames = [];
                    for (let i = 0; i < response.length; i++) {
                        listOfPipelineNames.push(response[i].name);
                    }
                    responseHandler(listOfPipelineNames);
                }
            });
        },
        getPipelineDetailFromAWS = function (pipelineName, responseHandler) {
            jquery.ajax({
                dataType: "json",
                url: "/pipeline/" + pipelineName,
                success: function (response) {
                    responseHandler(response);
                }
            });
        },
        parsePipelineState = function (stageState, commitMessage) {
            let status = "", statusChange = null, url = "";
            for (let i = 0; i < stageState.actionStates.length; i++) {
              if (stageState.actionStates[i].latestExecution != null) {
                status = stageState.actionStates[i].latestExecution.status.toLowerCase();
                statusChange = stageState.actionStates[i].latestExecution.lastStatusChange;
                url = stageState.actionStates[i].latestExecution.externalExecutionUrl;
              }
              if (status != "") {
                  break;
              }
            }
          return {
                name: stageState.stageName,
                latestStatus: status,
                lastStatusChange: statusChange,
                externalExecutionUrl: url,
                commitMessage: commitMessage
            };
        },
        getPipelineDetails = function (pipelineName, responseHandler) {
            let stages = [];
            getPipelineDetailFromAWS(pipelineName,
                function (response) {
                    for (let i = 0; i < response.stageStates.length; i++) {
                        stages.push(parsePipelineState(response.stageStates[i], response.commitMessage));
                    }
                    responseHandler(stages);
                });
        };

    return {
        getPipelines: getPipelines,
        getPipelineDetails: getPipelineDetails,
    };
};

