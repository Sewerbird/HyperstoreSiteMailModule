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
					console.log("getuser is ",res,err,ver);
					module.mailStore.resetReactivity(function(err){
						//Inbox Find
						module.mailStore.find({user_id: module.user._id, recipient_id: module.user._id, box: 'inbox'},{sort:{createdAt:-1}},function(res,err,ver){
							console.info("@#*)U@#%&)@#%&)");
							console.log("got find back",res,err,ver);
							if(err) throw err
							else if(_.size(res)>0)
							{
								console.info(res,module.user._id,module.user._id);
								self.setState({'inbox':{header:"Inbox", emails:res}})
							}
							else
								console.warn("Empty Inbox");
						})
						//Outbox Find
						module.mailStore.find({user_id: module.user._id, sender_id: module.user._id, box:'outbox'},{sort:{createdAt:-1}},function(res,err,ver){
							console.info("@#*)U@#%&)@#%&)");
							console.log("got find back",res,err,ver);
							if(err) throw err
							else if(_.size(res)>0)
							{
								self.setState({'outbox':{header:"Outbox", emails:res}})
							}
							else
								console.warn("Empty Outbox");
						})
					});
				})
				return {data:[]};
			},
			handleMailRead : function(mail){
				var self = this;
				module.mailStore.update({_id:mail._id, user_id: module.user._id},{$set: {hasRead:true}},function(res,err,ver){
					if(err) throw err;
					else if(res)
					{

					}
				});
			},
			handleMailSubmit : function(recipient_name, text, subject){
				var self = this;
				module.userStore.findOne({username: recipient_name},{reactive:false},function(res,err,ver){
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
							user_id: module.user._id,
							sender_username: module.user.username,
							recipient_username: recipient.username,
							box:'outbox'
						}
						var recipientMemo = {
							sender_id: module.user._id,
							recipient_id: recipient._id,
							message_text: text,
							subject:subject,
							user_id: recipient._id,
							sender_username: module.user.username,
							recipient_username: recipient.username,
							box:'inbox'
						}
						module.mailStore.insert(recipientMemo,function(res,err,ver){
							if(res && !err)
							{
								module.mailStore.insert(senderMemo, function(res,err,ver){
									if(res && !err)
									{
										console.log("Successfully got own copy ",res[0])
										self.switchToOutbox({})
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
				this.setState({currentView:'compose',replySettings:options?options:{}});
			},
			render: function(){
				//Standard view
				var currentView;
				console.log("Rendering main view. this.state = ",this.state);
				if(this.state.currentView == 'compose')
					currentView = ComposeView({onMail:this.handleMailSubmit, replySettings:this.state.replySettings})
				else if(this.state.currentView == 'outbox')
					currentView = BoxView({box:this.state.outbox, onReply:this.switchToCompose, onRead:this.handleMailRead})
				else //default to inbox
					currentView = BoxView({box:this.state.inbox, onReply:this.switchToCompose, onRead:this.handleMailRead});

				//Make 'unread' badge counts
				if(this.state.outbox) var outboxSize = _.size(_.filter(this.state.outbox.emails,function(message){return !message.hasRead}));
				if(this.state.inbox) var inboxSize = _.size(_.filter(this.state.inbox.emails,function(message){return !message.hasRead}));

				return (
						<div className="MailModule panel panel-default container" style={{"padding":"5px"}} >	 
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
					)
			}
	});
	var ComposeView = React.createClass({displayName:"ComposeView",
		onMail: function(event){
			event.preventDefault();
			var recipient = this.refs.recipient.getDOMNode().value;
			var mailtext = this.refs.mailText.getDOMNode().value;
			var subject = this.refs.subject.getDOMNode().value;
			this.props.onMail(recipient, mailtext,subject);
		},
		render: function(){
			var optSubject = this.props.replySettings && this.props.replySettings.subject?this.props.replySettings.subject:undefined;
			var optReceipient = this.props.replySettings && this.props.replySettings.sender_username? this.props.replySettings.sender_username:undefined;
			var quotedText = this.props.replySettings && this.props.replySettings.message_text? '"'+this.props.replySettings.message_text+'"':undefined;
			return(
				<div className="panel panel-default" id="sendMessageForm">
					<div className="panel-heading"><h4>Compose Message...</h4></div>
					<form className="panel-body" onSubmit={this.onMail}>
						<div className="input-group">
						  	<span className="input-group-addon"><span className="glyphicon glyphicon-user"></span></span>
						  	<input type="text" ref="recipient" tabIndex="1" className="form-control" placeholder="Send To..." defaultValue={optReceipient}/>
							  	<span className="input-group-addon" style={{padding:"1px"}}><button tabIndex="4" type="submit" className="btn btn-sm btn-success"><span className="glyphicon glyphicon-send"></span></button></span>
						</div>
						<div className="input-group">
							<span className="input-group-addon"><span className="glyphicon glyphicon-bullhorn"></span></span>						  
						  	<input type="text" ref="subject" tabIndex="2" className="form-control" placeholder="(No Subject)" defaultValue={optSubject}/>
						</div>
						<textarea ref="mailText" className="form-control" tabIndex="3" rows="10" style={{'max-width':"100%"}}>{quotedText}</textarea>
					</form>
				</div>		
			)	
		}
	})
	var BoxView = React.createClass({displayName:"BoxView",
		getInitialState: function(){
			if(this.props.box)
				return {batchSize:10, totPages: Math.ceil(_.size(this.props.box.emails)/10), page:0}
			return {batchSize:10, totPages: 1, page:0}
		},
		componentWillReceiveProps: function(){
			this.setBatchSize(10);
		},
		setBatchSize100: function(event){
			event.preventDefault();
			this.setBatchSize(100)
		},
		setBatchSize50: function(event){
			event.preventDefault();
			this.setBatchSize(50)
		},
		setBatchSize25: function(event){
			event.preventDefault();
			this.setBatchSize(25)
		},
		setBatchSize10: function(event){
			event.preventDefault();
			this.setBatchSize(10)
		},
		setBatchSize: function(val){
			$('#pagerBatchStatus').text(val);
			if(this.props.box)
			this.replaceState(
				{totPages:Math.ceil(_.size(this.props.box.emails)/val),
				page:Math.floor(this.state.page * this.state.batchSize/val),
				batchSize:val}
			);
		},
		handleMailRead: function(message){
			this.props.onRead(message);
		},
		handleMessageReply: function(message){
			this.props.onReply(message);
		},
		handleMessageDeletion: function(id){
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
			var inputArray = emailArray.slice(Math.max(this.state.batchSize * this.state.page,0), Math.min(this.state.batchSize * (this.state.page +1),_.size(emailArray)));
			result = _.flatten(_.map(inputArray,function(email){
				return [MailBoxItem({onReply: self.handleMessageReply, onRead:self.handleMailRead, onDeletion:self.handleMessageDeletion, message: email, personField: personField}),
						MessageView({_id:email._id})];
			}));
			return result;
		},
		render: function(){
			console.log("Showing box view",this.props.box);
			var header = this.props.box && this.props.box.header?this.props.box.header:"Blank"
			var relevantPerson = header != "Outbox"?"Sender":"Sent To";
			var relevantPersonField = header != "Outbox"?"sender_username":"recipient_username";
			var mails = this.props.box && this.props.box.emails?this.mapMailsToViews(this.props.box.emails, relevantPersonField):[];
			var nextDisabled = this.state.page < this.state.totPages-1?"active":"disabled"
			var prevDisabled = this.state.page == 0 ? "disabled" : "active"
			return (
					<div className="BoxView panel panel-default">
						<div className="panel-heading">
							<h3>{header}
							<div className="btn-group pull-right" style={{'display':'inline-block'}}>
								<button type="button" className={"btn btn-default "+prevDisabled} onClick={this.prevPage}>Prev</button>
								<div className="btn-group">
									<button id="pagerBatchStatus" type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown">{this.state.batchSize}</button>
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
			var myID = this.props.message._id;
			var message = this.props.message.message_text;
			var target = $('#'+myID+'_view');
			var targetText = $('#'+myID+'_message');
			if(!message.hasRead)
				this.readMessage();
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
		readMessage: function(){
			this.props.onRead(this.props.message);
		},
		deleteMessage: function(){
			var myID = this.props.message._id;
			this.props.onDeletion(myID);
		},
		replyMessage: function(){
			this.props.onReply(this.props.message);
		},
		render: function(){
			var subject = this.props.message.subject;
			var date = moment(this.props.message.createdAt).format("llll");
			var from = this.props.message[this.props.personField]
			var id = this.props.message._id;
			var isread = this.props.message.hasRead?"mail-read":"mail-unread";
			return (
					<tr id={id} className={isread}>
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