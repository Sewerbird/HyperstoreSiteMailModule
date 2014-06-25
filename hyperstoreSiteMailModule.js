/**
* @jsx React.DOM
*/
function HyperstoreSiteMailModule(domTargetID, mailURL, options){
	var module = this;
	module.mailStore = new Backwire.Hyperstore(mailURL);
	module.user = false;
	var MailModule = React.createClass({displayName:"MailModule",
			getInitialState: function(){
				var self = this;
				module.mailStore.getUser(function(res,err,ver){
					module.user = res;
					/*
					module.mailStore.find({user_id:module.user},function(res,err,ver){
						if(res && !err)
						{
							self.setState(res);
							console.log(res);
						}
						else if(err) console.error(err);
						else console.warn("Mail for user_id "+module.user._id+" not found.");
					});*/
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
						<div className="MailModule panel panel-default container" style={{"padding":"5px"}} >	 
							<div class="row">
								<div className="col-md-2 col-2 well well-sm" id="mailSidebar" style={{height:"100%"}}>
									<h4 style={{'text-align':'center'}}>Options</h4>
									<ul className="list-group">
										<li className="list-group-item"><a href="#">Inbox <span className="badge pull-right">21</span></a></li>
										<li className="list-group-item"><a href="#">Outbox <span className="badge pull-right">2</span></a></li>
										<li className="list-group-item"><a href="#">Send Message</a></li>
									</ul>
								</div>
								<div className="col-md-10 col-10" id="mailContent">
									<BoxView />
								</div>
							</div>
							<div class="row">
								<div className="col-md-2" />
								<div className="col-md-10">
									<div className="panel panel-default" id="sendMessageForm">
										<div className="panel-heading"><h4>Compose Message...</h4></div>
										<form className="panel-body">
											<div className="input-group">
											  <span className="input-group-addon"><span className="glyphicon glyphicon-user"></span></span>
											  <input type="text" className="form-control" placeholder="Send To..." />
  											  <span className="input-group-addon" style={{padding:"1px"}}><button className="btn btn-sm btn-success"><span className="glyphicon glyphicon-send"></span></button></span>
											</div>
											<textarea className="form-control" rows="10" style={{'max-width':"100%"}}></textarea>
										</form>
									</div>
								</div>
							</div>
						</div>
					)
			}
	});
	var BoxView = React.createClass({displayName:"BoxView",
		render: function(){
			/*
			var mails = this.props.data.map(function (comment){
				return MailBoxItem({});
			});*/
			var mails = [MailBoxItem({}),MailBoxItem({}),MailBoxItem({})]
			return (
					<div className="BoxView panel panel-default">
						<div className="panel-heading">
							<h3>Your Inbox</h3>
						</div>
						<div className="panel-body">
							<table className="table">
								<thead>
									<th className="span2">Sender</th>
									<th className="span7">Subject</th>
									<th className="span2">Date</th>
									<th className="span1">Delete</th>
								</thead>
								<tbody>
									{mails}
								</tbody>
							</table>
						</div>
					</div>
				)
		}
	})
	var MailBoxItem = React.createClass({displayName:"MailBoxItem",
		render: function(){
			var subject = "Sign Up Now";
			var date = moment(new Date()).format("ll");
			var from = "Sewerbird"
			return (
					<tr>
							<td className="span2">
								<span>{from}</span>
							</td>
							<td className="span7">
								<a href="#">{subject}</a>
							</td>
							<td className="span2">
								<small >{date}</small>
							</td>
							<td className="span1">
								<button type="button" className="btn btn-danger btn-xs"><span className="glyphicon glyphicon-remove"></span></button>
							</td>
					</tr>
				)
		}
	})
	React.renderComponent(
		<MailModule />,
		document.getElementById(domTargetID)
	);	
}