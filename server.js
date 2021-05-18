// // HTTP basic authentication example in node.js using the RTC Server RESTful API
// const https = require('https')
// Customer ID
const customerKey = 'e88a7b8bdb7446aebd8713f68460546f';
// Customer secret
const customerSecret = '2b06a55b23ee4ca995a5e5df75b0fee0';
// Concatenate customer key and customer secret and use base64 to encode the concatenated string
const plainCredential = customerKey + ':' + customerSecret;
// Encode with base64
const encodedCredential = Buffer.from(plainCredential).toString('base64');

// authorizationField = "Basic " + encodedCredential

// // Set request parameters
// const options = {
//   hostname: 'api.agora.io',
//   port: 443,
//   path: '/dev/v1/projects',
//   method: 'GET',
//   headers: {
//     'Authorization':authorizationField,
//     'Content-Type': 'application/json'
//   }
// }

// // Create request object and send request
// const req = https.request(options, res => {
//   console.log(`Status code: ${res.statusCode}`)

//   res.on('data', d => {
//     process.stdout.write(d)
//   })
// })

// req.on('error', error => {
//   console.error(error)
// })

// req.end()
const express = require('express');
const app = express();
const axios = require('axios');
const cors = require('cors');
app.use(express.json());

app.use(cors());
// CORS FUNC CONFIG
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

const Authorization = `Basic ${Buffer.from(
  `${customerKey}:${customerSecret}`
).toString('base64')}`;

const AppId = '306d86f1ec2644c3affab320daef132c';

app.get('/', (req, res) => res.send('Agora Cloud Recording Server'));

app.post('/acquire', async (req, res) => {
  const acquire = await axios.post(
    `https://api.agora.io/v1/apps/${AppId}/cloud_recording/acquire`,
    {
      cname: req.body.channel,
      uid: req.body.uid,
      clientRequest: {
        resourceExpiredHour: 24,
      },
    },
    { headers: { Authorization } }
  );

  res.send(acquire.data);
});

app.post('/start', async (req, res) => {
  const appID = AppId;
  const resource = req.body.resource;
  const mode = req.body.mode;

  const start = await axios.post(
    `https://api.agora.io/v1/apps/${appID}/cloud_recording/resourceid/${resource}/mode/${mode}/start`,
    {
      cname: req.body.channel,
      uid: req.body.uid,
      clientRequest: {
        token: req.body.token,
        recordingConfig: {
          maxIdleTime: 400,
          streamTypes: 2,
          channelType: 1,
          videoStreamType: 0,
          transcodingConfig: {
            height: 360,
            width: 640,
            bitrate: 500,
            fps: 15,
            mixedVideoLayout: 1,
            backgroundColor: '#FFFFFF',
            backgroundImage: 'https://i.ibb.co/98y9ZSN/parrotsays.jpg',
          },
        },
        // extensionServiceConfig: {
        //   errorHandlePolicy: 'error_abort',
        //   extensionServices: [
        //     {
        //       serviceName: 'web_recorder_service',
        //       errorHandlePolicy: 'error_abort',
        //       serviceParam: {
        //         url: 'http://localhost:3000/?user_id=test&username=testhttp://localhost:3000/',
        //         audioProfile: 0,
        //         videoWidth: 1280,
        //         videoHeight: 720,
        //         maxRecordingHour: 72,
        //       },
        //     },
        //   ],
        // },
        recordingFileConfig: {
          avFileType: ['hls', 'mp4'],
        },
        storageConfig: {
          vendor: 1,
          region: 5,
          bucket: 'parrotrelease',
          accessKey: 'AKIAZJZ4IZ3VYZBRLFFY',
          secretKey: '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',
          fileNamePrefix: ['liveStream', 'videos'],
        },
      },
    },
    { headers: { Authorization } }
  );

  res.send(start.data);
});

app.post('/query', async (req, res) => {
  const appID = AppId;
  const resource = req.body.resource;
  const sid = req.body.sid;
  const mode = req.body.mode;

  const query = await axios.get(
    `https://api.agora.io/v1/apps/${appID}/cloud_recording/resourceid/${resource}/sid/${sid}/mode/${mode}/query`,
    { headers: { Authorization } }
  );
  res.send(query.data);
});

app.post('/stop', async (req, res) => {
  const appID = AppId;
  const resource = req.body.resource;
  const sid = req.body.sid;
  const mode = req.body.mode;

  const stop = await axios.post(
    `https://api.agora.io/v1/apps/${appID}/cloud_recording/resourceid/${resource}/sid/${sid}/mode/${mode}/stop`,
    {
      cname: req.body.channel,
      uid: req.body.uid,
      clientRequest: {},
    },
    { headers: { Authorization } }
  );
  res.send(stop.data);
});

app.post('/updateSubscription', async (req, res) => {
  const appID = AppId;
  const resource = req.body.resource;
  const sid = req.body.sid;
  const mode = req.body.mode;

  const updateSubscription = await axios.get(
    `https://api.agora.io/v1/apps/${appID}/cloud_recording/resourceid/${resource}/sid/${sid}/mode/${mode}/update`,
    {
      cname: req.body.channel,
      uid: req.body.uid,
      clientRequest: {
        streamSubscribe: {
          audioUidList: req.body.audioSubscription,
          videoUidList: req.body.videoSubscription,
        },
      },
    },
    { headers: { Authorization } }
  );

  res.send(updateSubscription.data);
});

app.post('/updateLayout', async (req, res) => {
  const appID = AppId;
  const resource = req.body.resource;
  const sid = req.body.sid;
  const mode = req.body.mode;

  const body = {
    cname: req.body.channel,
    uid: req.body.uid,
    clientRequest: {
      mixedVideoLayout: req.body.layout,
      backgroundColor: req.body.backgroundColor,
    },
  };

  if (req.body.layoutConfig === 3) {
    body.clientRequest.layoutConfig = req.body.layoutConfig;
  }

  const updateLayoutConfig = await axios.get(
    `https://api.agora.io/v1/apps/${appID}/cloud_recording/resourceid/${resource}/sid/${sid}/mode/${mode}/updateLayout`,
    body,
    { headers: { Authorization } }
  );

  res.send(updateLayoutConfig.data);
});

const port = process.env.PORT || 5000;
app.listen(port, () =>
  console.log(`Agora Cloud Recording Server listening at Port ${port}`)
);
