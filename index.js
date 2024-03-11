const axios = require('axios');
const cheerio = require('cheerio');
const http = require('http');

// スタートとなる数字
let startNumber = 15;

// スクレイピングの最大回数
const maxIterations = 300; // 例として10回とします

// ベースURL
const baseUrl = 'https://ncode.syosetu.com/Fn5990cm/';

// テキストデータを格納するための配列
let textDataArray = [];

// メインの処理
async function main() {
  // 並行してリクエストを送信するための配列
  const requests = [];

  for (let i = 0; i < maxIterations; i++) {
    const url = `${baseUrl}${startNumber++}`; // 現在の数字を使ってURLを構築
    requests.push(fetchData(url));
  }

  try {
    // すべてのリクエストを並行して送信し、完了を待つ
    const responses = await Promise.all(requests);

    // レスポンスを処理
    responses.forEach(response => {
      const $ = cheerio.load(response.data);
      $('p').each(function() {
        const extractedText = $(this).text().trim();
        textDataArray.push(extractedText);
      });
    });

    // HTMLを提供する
    serveHtml();
  } catch (error) {
    console.error('Error:', error);
  }
}

// axiosを使用してデータを取得する関数
async function fetchData(url) {
  try {
    const response = await axios.get(url);
    return response;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

// テキストをHTML形式に変換して提供する関数
function serveHtml() {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>web小説</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
      <style>
        @charset "UTF-8";
        @import url('https://fonts.googleapis.com/css2?family=Zen+Kurenaido&display=swap');
        body {
          font-family: "Zen Kurenaido", sans-serif;
          font-weight: 400;
          font-style: normal;
          background-image: url('https://craft.sci.fieldsofeinherjar.com/img/futuristic_landscape_1.jpeg');
          background-size: cover; 
          background-position: center; 
          background-repeat: no-repeat; 
          background-attachment: fixed; 
          color: white; 
          margin: 0; 
          padding: 20px; 
        }

        .content {
          max-width: 800px; 
          margin: 0 auto; 
        }
      </style>
    </head>
    <body>
      <div class="content">
        ${textDataArray.map(line => `<p>${line}</p>`).join('')}
      </div>
    </body>
    </html>
  `;

  // HTTPサーバーを作成し、HTMLコンテンツを提供する
  const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(htmlContent);
  });

  // サーバーを指定ポートで起動
  const port = 3000;
  server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
  });
}

// メインの処理を実行
main();
