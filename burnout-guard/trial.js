// Using fetch with async/await
async function callGMIAPI(token) {
  const url = 'https://api.gmi-serving.com/v1/chat/completions';
  
  const requestBody = {
    "model": "deepseek-ai/DeepSeek-Prover-V2-671B",
    "messages": [
      {
        "role": "user",
        "content": "Tell me a good time to sleep"
      }
    ],
    "max_tokens": 2000,
    "temperature": 1
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Response:', data);
    console.log('Response content:', data.choices[0].message.content);
    return data;
  } catch (error) {
    console.error('Error calling GMI API:', error);
    throw error;
  }
}

// Usage example
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2ZjY4ZGNiLTc2MjYtNDU1YS04MTJlLWNjZWQ0NGM1MmFmMSIsInR5cGUiOiJpZV9tb2RlbCJ9.wSR0pMUfjAfTijf8jJSaiec1FutdKCcCJq6RlJo62uM';
callGMIAPI(token);

// Alternative: Using fetch with .then()
function callGMIAPIWithPromises(token) {
  const url = 'https://api.gmi-serving.com/v1/chat/completions';
  
  const requestBody = {
    "model": "deepseek-ai/DeepSeek-R1",
    "messages": [
      {
        "role": "user",
        "content": "Hello!"
      }
    ],
    "max_tokens": 2000,
    "temperature": 1
  };

  return fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Response:', data);
    return data;
  })
  .catch(error => {
    console.error('Error calling GMI API:', error);
    throw error;
  });
}

// For Node.js environments, you might need to install node-fetch
// npm install node-fetch
// Then uncomment the line below:
// const fetch = require('node-fetch');

// For environments that need XMLHttpRequest (older browsers)
function callGMIAPIWithXHR(token) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = 'https://api.gmi-serving.com/v1/chat/completions';
    
    const requestBody = {
      "model": "deepseek-ai/DeepSeek-R1",
      "messages": [
        {
          "role": "user",
          "content": "Hello!"
        }
      ],
      "max_tokens": 2000,
      "temperature": 1
    };

    xhr.open('POST', url, true);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            console.log('Response:', data);
            resolve(data);
          } catch (error) {
            reject(new Error('Failed to parse response JSON'));
          }
        } else {
          reject(new Error(`HTTP error! status: ${xhr.status}`));
        }
      }
    };

    xhr.onerror = function() {
      reject(new Error('Network error occurred'));
    };

    xhr.send(JSON.stringify(requestBody));
  });
}