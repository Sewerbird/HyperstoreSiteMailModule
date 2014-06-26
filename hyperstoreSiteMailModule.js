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
					self.setState({'inbox':{header:"Your Inbox", emails:[]}});
					self.setState({'outbox':{header:"Your Outbox", emails:[]}});
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
			handleMailSubmit : function(recipient, text){
				/*
				module.mailStore.insert(answer,function(res,err,ver){
					if(res && !err)
					{
						console.log("Successfully posted ",res[0])
					} else console.error("Error posting answer: ", err);
				})
				*/
				console.log("Dear "+recipient+": "+text)
				this.switchToOutbox({})
			},
			switchToInbox : function(options){
				console.log("TODO: switching to inbox");
				this.setState({currentView:'inbox'});
			},
			switchToOutbox : function(options){
				console.log("TODO: switching to outbox");
				this.setState({currentView:'outbox'});
			},
			switchToCompose : function(options){
				console.log("TODO: switching to compose");
				this.setState({currentView:'compose'});
			},
			render: function(){
				//Standard view
				var currentView;
				if(this.state.currentView == 'compose')
					currentView = ComposeView({onMail:this.handleMailSubmit})
				else if(this.state.currentView == 'outbox')
					currentView = BoxView(this.state.outbox)
				else //default to inbox
					currentView = BoxView(this.state.inbox);

				//Make 'unread' badge counts
				if(this.state.outbox) var outboxSize = _.size(this.state.outbox.emails);
				if(this.state.inbox) var inboxSize = _.size(this.state.inbox.emails);

				return (
						<div className="MailModule panel panel-default container" style={{"padding":"5px"}} >	 
							<div class="row">
								<div className="col-md-2 col-2 well well-sm" id="mailSidebar" style={{height:"100%"}}>
									<h4 style={{'text-align':'center'}}>Options</h4>
									<ul className="list-group">
										<li className="list-group-item"><a href="#" onClick={this.switchToInbox}>Inbox <span className="badge pull-right">{inboxSize}</span></a></li>
										<li className="list-group-item"><a href="#" onClick={this.switchToOutbox}>Outbox <span className="badge pull-right">{outboxSize}</span></a></li>
										<li className="list-group-item"><a href="#" onClick={this.switchToCompose}>Send Message</a></li>
									</ul>
								</div>
								<div className="col-md-10 col-10" id="mailContent">
									{currentView}
								</div>
							</div>
						</div>
					)
			}
	});
	var ComposeView = React.createClass({displayName:"ComposeView",
		onMail: function(event){
			event.preventDefault();
			var recipient = this.refs.recipient.getDOMNode().value;
			var mailtext = this.refs.mailText.getDOMNode().value
			this.props.onMail(recipient, mailtext);
		},
		render: function(){
			var optReceipient = this.props.optUser?this.props.optUser:undefined;
			var quotedText = this.props.quotedText?this.props.quotedText:"";
			return(
				<div className="panel panel-default" id="sendMessageForm">
					<div className="panel-heading"><h4>Compose Message...</h4></div>
					<form className="panel-body" onSubmit={this.onMail}>
						<div className="input-group">
						  <span className="input-group-addon"><span className="glyphicon glyphicon-user"></span></span>
						  <input type="text" ref="recipient" tabIndex="1" className="form-control" placeholder="Send To..." value={optReceipient}/>
							  <span className="input-group-addon" style={{padding:"1px"}}><button tabIndex="3" type="submit" className="btn btn-sm btn-success"><span className="glyphicon glyphicon-send"></span></button></span>
						</div>
						<textarea ref="mailText" className="form-control" tabIndex="2" rows="10" style={{'max-width':"100%"}}>{quotedText}</textarea>
					</form>
				</div>		
			)	
		}
	})
	var BoxView = React.createClass({displayName:"BoxView",
		getInitialState: function(){
			return {batchSize:10, totPages: 1, page:0}
		},
		setBatchSize100: function(){
			this.setBatchSize(100)
			$('#pagerBatchStatus').text(100);
		},
		setBatchSize50: function(){
			this.setBatchSize(50)
			$('#pagerBatchStatus').text(50);
		},
		setBatchSize25: function(){
			this.setBatchSize(25)
			$('#pagerBatchStatus').text(25);
		},
		setBatchSize10: function(){
			this.setBatchSize(10)
			$('#pagerBatchStatus').text(10);
		},
		setBatchSize: function(val){
			console.log("TODO: Setting batch size to "+val);
			this.setState({'batchSize':val});
		},
		handleMessageReply: function(id){
			console.log("TODO: Handling message reply");
		},
		handleMessageDeletion: function(id){
			console.log("TODO: Handling message deletion");
		},
		nextPage: function(){
			console.log("TODO: Going next page");
			var tPage = Math.min(this.state.page + 1,this.state.totPages-1);
			this.setState({'page':tPage})
			console.log("on page "+tPage);
		},
		prevPage: function(){
			console.log("TODO: Going prev page");
			var tPage = Math.max(this.state.page - 1,0);
			this.setState({'page':tPage})
			console.log("on page "+tPage);
		},
		render: function(){
			/*
			var mails = this.props.data.map(function (comment){
				return MailBoxItem({});
			});*/
			var mails = [MailBoxItem({onReply:this.handleMessageReply, onDeletion:this.handleMessageDeletion}),MessageView({}),MailBoxItem({}),MailBoxItem({})]
			var header = this.props.header?this.props.header:"Blank"
			var nextDisabled = this.state.page == this.state.totPages-1 ? "disabled" : "active"
			var prevDisabled = this.state.page == 0 ? "disabled" : "active"
			return (
					<div className="BoxView panel panel-default">
						<div className="panel-heading">
							<h3>{header}
							<div className="btn-group pull-right" style={{'display':'inline-block'}}>
								<button type="button" className={"btn btn-default "+prevDisabled} onClick={this.prevPage}>Prev</button>
								<div className="btn-group">
									<button id="pagerBatchStatus" type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown">{this.state.batchSize}<span class="caret"></span></button>
									    <ul className="dropdown-menu">
									      <li><a href="#" onClick={this.setBatchSize100}>100</a></li>
									      <li><a href="#" onClick={this.setBatchSize50}>50</a></li>
									      <li><a href="#" onClick={this.setBatchSize25}>25</a></li>
									      <li><a href="#" onClick={this.setBatchSize10}>10</a></li>
									    </ul>
								</div>
								<button type="button" className={"btn btn-default "+nextDisabled} onClick={this.nextPage}>Next</button>
							</div></h3>
						</div>
						<div className="panel-body">
							<table className="table" style={{'max-width':"100%",'min-width':"100%"}}>
								<thead>
									<th colSpan="2">Sender</th>
									<th colSpan="7">Subject</th>
									<th colSpan="2">Date</th>
									<th colSpan="1">Actions</th>
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
		toggleMessage: function(){
			console.log("message toggled");
			var myID = "foo"
			var target = $('#'+myID+'_view');
			var targetText = $('#'+myID+'_message');
			var message = "I am a teacup. I thought you might like to know that. After all, you come from a conservative family and I figured it'd be best to be upfront about it."
			if(target.is(":hidden"))
			{
				target.show();
				targetText.text(message);
			}
			else
			{
				target.hide();
				targetText.text("");
			}
		},
		deleteMessage: function(){
			console.log("deleting message");
			var myID = "foo";
			this.props.onDeletion(myID);
		},
		replyMessage: function(){
			console.log("replying to message");
			var message = "I am a teacup. I thought you might like to know that. After all, you come from a conservative family and I figured it'd be best to be upfront about it."
			var from = "Sewerbird";
			var myID = "foo";
			this.props.onReply(myID, message);
		},
		render: function(){
			var subject = "Sign Up Now";
			var date = moment(new Date()).format("ll");
			var from = "Sewerbird"
			var id = "foo";
			return (
					<tr id={id}>
						<td colSpan="2">
							<span>{from}</span>
						</td>
						<td colSpan="7">
							<a href="#">{subject}</a>
						</td>
						<td colSpan="2">
							<small >{date}</small>
						</td>
						<td colSpan="1">
							<div className="btn-toolbar" role="toolbar">
								<div className="btn-group">
									<button type="button" className="btn btn-info btn-xs" onClick={this.toggleMessage}><span className="glyphicon glyphicon-eye-open"></span></button>
								</div>
								<div className="btn-group">
									<button type="button" className="btn btn-success btn-xs" onClick={this.replyMessage}><span className="glyphicon glyphicon-pencil"></span></button>
								</div>
								<div className="btn-group">
									<button type="button" className="btn btn-danger btn-xs" onClick={this.deleteMessage}><span className="glyphicon glyphicon-remove"></span></button>
								</div>
							</div>
						</td>
					</tr>
				)
		}
	})
	var MessageView = React.createClass({displayName:"MessageView",
		render: function(){
			var subject = "Signup Now for Free Mortgage!";
			var id = "foo"+"_view"
			var tid = "foo"+"_message"
			return(
				<tr id={id} style={{display:'none'}}>
					<td colSpan="12">
						<textarea id={tid} rows="10" readOnly="true" style={{'min-width':'100%','max-width':"100%"}}></textarea>	
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