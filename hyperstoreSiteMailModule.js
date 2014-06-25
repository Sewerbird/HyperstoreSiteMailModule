function HyperstoreSiteMailModule(domTargetID, mailURL, options){
	var module = this;
	module.mailStore = new Backwire.Hyperstore(mailURL);
	module.user = false;
	var MailModule = React.createClass({displayName:"MailModule",
			getInitialState: function(){
				var self = this;
				module.mailStore.getUser(function(res,err,ver){
					module.user = res;
					module.mailStore.find({user_id:module.user},function(res,err,ver){
						if(res && !err)
						{
							self.setState(res);
						}
						else if(err) console.error(err);
						else console.warn("Mail for user_id "+module.user._id+" not found.");
					});
				})
				return {data:[]};
			},
			handleMailSubmit : function(answer){
				/*
				module.mailStore.insert(answer,function(res,err,ver){
					if(res && !err)
					{
						console.log("Successfully posted ",res[0])
					} else console.error("Error posting answer: ", err);
				})
				*/
			},
			render: function(){
				//Standard view
				return (
						<div className="MailModule panel panel-default" style={{"padding":"5px"}}>
						</div>
					)
			}
	});
	React.renderComponent(
		<MailModule />,
		document.getElementById(domTargetID)
	);	
}