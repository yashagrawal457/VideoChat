var KEY_ENTER=13;
var maxCallers = 3;
var maxConnect = maxCallers + 1;

easyrtc.dontAddCloseButtons(false);
$(document).ready(function(){
	var $input=$(".chat-input")
		,$sendButton=$(".chat-send")
		,$messagesContainer=$(".chat-messages")
		,$messagesList=$(".chat-messages-list")
		,$effectContainer=$(".chat-effect-container")
		,$infoContainer=$(".chat-info-container")

		,messages=0
		,bleeding=100
		,isFriendTyping=false
		,incomingMessages=0
		,lastMessage=""
	;
	


  easyrtc.joinRoom(roomname, null,
    function(roomName) {
      console.log("I'm now in room " + roomName);
    },
    function(errorCode, errorText, roomName) {
      console.log("had problems joining " + roomName);
    }
  );
  easyrtc.setRoomOccupantListener(callEverybodyElse);
  easyrtc.setPeerListener(messageListener);
  easyrtc.setUsername(username);

  easyrtc.easyApp('ChatRoom', 'self', ['caller0', 'caller1', 'caller2'],
    function(myId) {
      console.log("My easyrtcid is " + myId);
      console.log("My username is " + easyrtc.idToName(myId));
    }
  );



	function gooOn(){
		setFilter('url(#goo)');
	}
	function gooOff(){
		setFilter('none');
	}
	function setFilter(value){
		$effectContainer.css({
			webkitFilter:value,
			mozFilter:value,
			filter:value,
		});
	}

	function addMessage(message,self){
		var $messageContainer=$("<li/>")
			.addClass('chat-message '+(self?'chat-message-self':'chat-message-friend'))
			.appendTo($messagesList)
		;
		var $messageBubble=$("<div/>")
			.addClass('chat-message-bubble')
			.appendTo($messageContainer)
		;
		$messageBubble.text(message);

		var oldScroll=$messagesContainer.scrollTop();
		$messagesContainer.scrollTop(9999999);
		var newScroll=$messagesContainer.scrollTop();
		var scrollDiff=newScroll-oldScroll;
		TweenMax.fromTo(
			$messagesList,0.4,{
				y:scrollDiff
			},{
				y:0,
				ease:Quint.easeOut
			}
		);

		return {
			$container:$messageContainer,
			$bubble:$messageBubble
		};
	}



	function sendMessage(){
				var message=$input.text();
		
		if(message=="") return;
		var msg= message;
		  if(msg && msg != '') {
		    // message = showMessage(easyrtc.myEasyrtcid, msg);\
		    message = easyrtc.idToName(easyrtc.myEasyrtcid) + " : " + msg;
		    showMessage(easyrtc.myEasyrtcid, msg);
		    for(var i = 0; i < maxCallers; i++ ) {
		      var easyrtcid = easyrtc.getIthCaller(i);
		      if(easyrtcid && easyrtcid != '') {
		        easyrtc.sendPeerMessage(easyrtcid, 'im',  msg);
		      }
		    }
		  }

	}

	function messageListener(easyrtcid, msgType, content) {
	console.log( "here" +  easyrtcid+ content)
  showMessage(easyrtcid, content);
}



	function showMessage(easyrtcid, message){
		var message = easyrtc.idToName(easyrtcid) + ':' + message
		  console.log("inside" + message)
		lastMessage=message;

		var messageElements=addMessage(message,true)
			,$messageContainer=messageElements.$container
			,$messageBubble=messageElements.$bubble
		;

		var oldInputHeight=$(".chat-input-bar").height();
		$input.text('');
		updateChatHeight();
		var newInputHeight=$(".chat-input-bar").height();
		var inputHeightDiff=newInputHeight-oldInputHeight

		var $messageEffect=$("<div/>")
			.addClass('chat-message-effect')
			.append($messageBubble.clone())
			.appendTo($effectContainer)
			.css({
				left:$input.position().left-12,
				top:$input.position().top+bleeding+inputHeightDiff
			})
		;


		var messagePos=$messageBubble.offset();
		var effectPos=$messageEffect.offset();
		var pos={
			x:messagePos.left-effectPos.left,
			y:messagePos.top-effectPos.top
		}

		var $sendIcon=$sendButton.children("i");
		TweenMax.to(
			$sendIcon,0.15,{
				x:30,
				y:-30,
				force3D:true,
				ease:Quad.easeOut,
				onComplete:function(){
					TweenMax.fromTo(
						$sendIcon,0.15,{
							x:-30,
							y:30
						},
						{
							x:0,
							y:0,
							force3D:true,
							ease:Quad.easeOut
						}
					);
				}
			}
		);

		gooOn();

		
		TweenMax.from(
			$messageBubble,0.8,{
				y:-pos.y,
				ease:Sine.easeInOut,
				force3D:true
			}
		);

		var startingScroll=$messagesContainer.scrollTop();
		var curScrollDiff=0;
		var effectYTransition;
		var setEffectYTransition=function(dest,dur,ease){
			return TweenMax.to(
				$messageEffect,dur,{
					y:dest,
					ease:ease,
					force3D:true,
					onUpdate:function(){
						var curScroll=$messagesContainer.scrollTop();
						var scrollDiff=curScroll-startingScroll;
						if(scrollDiff>0){
							curScrollDiff+=scrollDiff;
							startingScroll=curScroll;

							var time=effectYTransition.time();
							effectYTransition.kill();
							effectYTransition=setEffectYTransition(pos.y-curScrollDiff,0.8-time,Sine.easeOut);
						}
					}
				}
			);
		}

		effectYTransition=setEffectYTransition(pos.y,0.8,Sine.easeInOut);
		
		// effectYTransition.updateTo({y:800});

		TweenMax.from(
			$messageBubble,0.6,{
				delay:0.2,
				x:-pos.x,
				ease:Quad.easeInOut,
				force3D:true
			}
		);
		TweenMax.to(
			$messageEffect,0.6,{
				delay:0.2,
				x:pos.x,
				ease:Quad.easeInOut,
				force3D:true
			}
		);

		TweenMax.from(
			$messageBubble,0.2,{
				delay:0.65,
				opacity:0,
				ease:Quad.easeInOut,
				onComplete:function(){
					TweenMax.killTweensOf($messageEffect);
					$messageEffect.remove();
					if(!isFriendTyping)
						gooOff();
				}
			}
		);

		messages++;

		
	}

	function updateChatHeight(){
		$messagesContainer.css({
			height:460-$(".chat-input-bar").height()
		});
	}

	$input.keydown(function(event) {
		if(event.keyCode==KEY_ENTER){
			event.preventDefault();
			sendMessage();
		}
	});
	$sendButton.click(function(event){
		event.preventDefault();
		sendMessage();
		// $input.focus();
	});
	$sendButton.on("touchstart",function(event){
		event.preventDefault();
		sendMessage();
		// $input.focus();
	});

	$input.on("input",function(){
		updateChatHeight();
	});

	gooOff();
	updateChatHeight();
})



function callEverybodyElse (roomName, otherPeople) {

  console.log(roomName);
  easyrtc.setRoomOccupantListener(null); // so we're only called once.

  var list = [];
  var connectCount = 0;
  for(var easyrtcid in otherPeople ) {
    list.push(easyrtcid);
  }
  //
  // Connect in reverse order. Latter arriving people are more likely to have
  // empty slots.
  //
  function establishConnection (position) {
    function callSuccess() {
      connectCount++;
      if( connectCount < maxCallers && position > 0) {
        establishConnection(position - 1);
      }
    }
    function callFailure(errorCode, errorText) {
      easyrtc.showError(errorCode, errorText);
      if( connectCount < maxCallers && position > 0) {
        establishConnection(position - 1);
      }
    }
    easyrtc.call(list[position], callSuccess, callFailure);

  }
  if( list.length > 0) {
    establishConnection(list.length - 1);
  }
}




// function showMessage(easyrtcid, content) {
//   var html = '<p> ' + easyrtc.idToName(easyrtcid) + ':' + content + '</p>';
//   //var html = '<p>Test Message</p>'
//   console.log(html);
//   //$('#records').append(html);
//   console.log(html+"contenbt= editable")
//   return (easyrtc.idToName(easyrtcid) + ':' + content)
// }

function loggedInListener(roomName, otherPeers) {
  console.log(roomName);
  var otherClientDiv = document.getElementById('otherClients');
  while (otherClientDiv.hasChildNodes()) {
    otherClientDiv.removeChild(otherClientDiv.lastChild);
  }
  for(var i in otherPeers) {
    var button = document.createElement('button');
    button.onclick = function(easyrtcid) {
      return function() {
        performCall(easyrtcid);
      }
    }(i);

    label = document.createTextNode(i);
    button.appendChild(label);
    otherClientDiv.appendChild(button);
  }
}


function performCall(easyrtcid) {
  easyrtc.call(
    easyrtcid,
    function(easyrtcid) { console.log("completed call to " + easyrtcid);},
    function(errorMessage) { console.log("err:" + errorMessage);},
    function(accepted, bywho) {
      console.log((accepted?"accepted":"rejected")+ " by " + bywho);
    }
  );
}


// function sendMessage2 () {
//   var msg = $.trim($('#message').text());
//   $('#message').text('');
//   console.log(msg);
//   if(msg && msg != '') {
//     showMessage(easyrtc.myEasyrtcid, msg);
//     for(var i = 0; i < maxCallers; i++ ) {
//       var easyrtcid = easyrtc.getIthCaller(i);
//       if(easyrtcid && easyrtcid != '') {
//         easyrtc.sendPeerMessage(easyrtcid, 'im',  msg);
//       }
//     }
//   }
// }

function leaveRoom () {
  easyrtc.leaveRoom(roomname, null);
  window.location.replace('/');
}
