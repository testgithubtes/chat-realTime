
(function(){
  var element = function(id){
    return document.getElementById(id);
  };
  // Get Elements
  var status = element('status');
  var messages = element('messages');
  var textarea = element('textarea');
  var username = element('username');
  var clearBtn = element('clearBtn');

  // Set default status
  var statusDefault = status.textContent;

  var setStatus = function(s){
    // Set status
    status.textContent = s;

    if(s !== statusDefault){
      var delay = setTimeout(function(){
        setStatus(statusDefault);
      }, 4000);
    }
  };
  // Connect to socket.io
  var socket = io.connect('http://127.0.0.1:4200');

  // Check for connection
  if(socket !== undefined){
    console.log('Connected to socket ...');

    // Handle Output
    socket.on('output', function(data){
      if(data.length){
        for(var x = 0;x<data.length;x++){
          // Build out message div
          var message = document.createElement('li');
          message.setAttribute('class', 'chat-message list-group-item');
          message.textContent = data[x].name+": "+data[x].message;
          messages.appendChild(message);
          messages.insertBefore(message, messages.firstChild);
        }
      }
    });

    // Get Status From Server
    socket.on('status', function(data){
      // Get message status
      setStatus((typeof data ==='object')? data.message : data);

      // If status is clear, clear text
      if(data.clear){
        textarea.value = '';
      }
    });

    // Key Press
    textarea.addEventListener('keypress', ()=> {
      socket.emit('typing', username.value );
    });

    // Handle Input
    textarea.addEventListener('keydown', function(event){
      // 13 key enter || return
      if(event.which === 13 && event.shiftKey == false){
        // Emit to server input
        socket.emit('input', {
          name: username.value,
          message: textarea.value
        });

        event.preventDefault();
      textarea.value ='';
      }

    });

    // Handle chat clear
    clearBtn.addEventListener('click',function(){
      socket.emit('clear');
    });

    // Clear Message
    socket.on('cleared', function(){
      messages.textContent = '';
    });

    // typing status
    socket.on('typing', (data) => {
      textarea.value =data+' is typing ...';
    });
  }

})();
