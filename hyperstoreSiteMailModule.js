/**
* @jsx React.DOM
*/
function HyperstoreSiteMailModule(domTargetID, mailURL, userURL, options){
	var module = this;
	module.mailStore = new Backwire.Hyperstore(mailURL);
	module.userStore = new Backwire.Hyperstore(userURL);
	module.user = false;
	var MailModule = React.createClass({displayName:"MailModule",
			getInitialState: function(){
				var self = this;
				module.mailStore.getUser(function(res,err,ver){
					module.user = res;
					self.setState({'inbox':{header:"Your Inbox", emails:[]}});
					self.setState({'outbox':{header:"Your Outbox", emails:[]}});
					//Inbox Find
					module.mailStore.find({owner_id: module.user._id, recipient_id: module.user._id},function(res,err,ver){
						if(err) throw err
						else if(res)
						{
							self.setState({'inbox':{header:"Inbox", emails:res}})
						}
						else
							console.warn("Empty Inbox");
					})
					//Outbox Find
					module.mailStore.find({owner_id: module.user._id, sender_id: module.user._id},function(res,err,ver){
						if(err) throw err
						else if(res)
						{
							self.setState({'outbox':{header:"Outbox", emails:res}})
						}
						else
							console.warn("Empty Inbox");
					})
				})
				return {data:[]};
			},
			handleMailSubmit : function(recipient_name, text, subject){
				module.userStore.findOne({username: recipient_name},function(res,err,ver){
					if(err) throw err;
					else if(res) 
					{
						if(!subject) subject = "(No Subject)"
						var recipient = res;
						var senderMemo = {
							sender_id: module.user._id,
							recipient_id: recipient._id,
							message_text: text,
							subject:subject,
							owner_id: module.user._id,
							sender_username: module.user.username,
							recipient_username: recipient.username
						}
						var recipientMemo = {
							sender_id: module.user._id,
							recipient_id: recipient._id,
							message_text: text,
							subject:subject,
							owner_id: recipient._id,
							sender_username: module.user.username,
							recipient_username: recipient.username
						}
						module.mailStore.insert(recipientMemo,function(res,err,ver){
							if(res && !err)
							{
								module.mailStore.insert(senderMemo, function(res,err,ver){
									if(res && !err)
									{
										console.log("Successfully got own copy ",res[0])
										this.switchToOutbox({})
									} else console.error("Error posting copy: ", err);
								})
								console.log("Successfully sent message ",res[0])
							} else console.error("Error posting message: ", err);
						})	
					}
					else
						alert("Unable to send message: recipient doesn't exist");
				})
			},
			switchToInbox : function(options){
				this.setState({currentView:'inbox',replySettings:{}});
			},
			switchToOutbox : function(options){
				this.setState({currentView:'outbox',replySettings:{}});
			},
			switchToCompose : function(options){
				console.log("TODO: passing data through here when appropriate");
				this.setState({currentView:'compose',replySettings:options?options:{}});
			},
			render: function(){
				//Standard view
				var currentView;
				if(this.state.currentView == 'compose')
					currentView = ComposeView({onMail:this.handleMailSubmit, replySettings:this.state.replySettings})
				else if(this.state.currentView == 'outbox')
					currentView = BoxView({box:this.state.outbox, onReply:this.switchToCompose})
				else //default to inbox
					currentView = BoxView({box:this.state.inbox, onReply:this.switchToCompose});

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
			var optReceipient = this.props.replySettings && this.props.replySettings.sender_username? this.props.replySettings.sender_username:undefined;
			var quotedText = this.props.replySettings && this.props.replySettings.message_text? '"'+this.props.replySettings.message_text+'"':undefined;
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
		handleMessageReply: function(message){
			console.log("TODO: Handling message reply");
			this.props.onReply(message);
		},
		handleMessageDeletion: function(id){
			console.log("TODO: Handling message deletion");
			module.mailStore.remove({_id: id},function(res,err,ver){
				if(err) throw err
			})
		},
		nextPage: function(){
			var tPage = Math.min(this.state.page + 1,this.state.totPages-1);
			this.setState({'page':tPage})
			console.log("on page "+tPage);
		},
		prevPage: function(){
			var tPage = Math.max(this.state.page - 1,0);
			this.setState({'page':tPage})
			console.log("on page "+tPage);
		},
		mapMailsToViews: function(emailArray, personField){
			var result = [];
			var self = this;
			result = _.flatten(_.map(emailArray,function(email){
				console.log("email",email);
				return [MailBoxItem({onReply: self.handleMessageReply, onDeletion:self.handleMessageDeletion, message: email, personField: personField}),
						MessageView({_id:email._id})];
			}));
			return result;
		},
		render: function(){
			var header = this.props.box && this.props.box.header?this.props.box.header:"Blank"
			var relevantPerson = header != "Outbox"?"Sender":"Sent To";
			var relevantPersonField = header != "Outbox"?"sender_username":"recipient_username";
			var mails = this.props.box && this.props.box.emails?this.mapMailsToViews(this.props.box.emails, relevantPersonField):[];
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
									<th colSpan="2">{relevantPerson}</th>
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
			console.log("message toggled ", this.props.message);
			var myID = this.props.message._id;
			var message = this.props.message.message_text;
			var target = $('#'+myID+'_view');
			var targetText = $('#'+myID+'_message');
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
			var myID = this.props.message._id;
			this.props.onDeletion(myID);
		},
		replyMessage: function(){
			console.log("replying to message");
			this.props.onReply(this.props.message);
		},
		render: function(){
			console.info("message",this.props.message);
			var subject = this.props.message.subject;
			var date = moment(this.props.message.createdAt).format("ll");
			var from = this.props.message[this.props.personField]
			var id = this.props.message._id;
			return (
					<tr id={id}>
						<td colSpan="2">
							<span>{from}</span>
						</td>
						<td colSpan="7">
							<a href="#" onClick={this.toggleMessage}>{subject}</a>
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
			var id = this.props._id+"_view"
			var tid = this.props._id+"_message"
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