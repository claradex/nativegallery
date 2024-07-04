<html>
<link rel="stylesheet" href="https://rsms.me/inter/inter.css">
    <head>
        <style>
        /* CSS */
:root { font-family: 'Inter', sans-serif; }
@supports (font-variation-settings: normal) {
  :root { font-family: 'Inter var', sans-serif; }
}
        body {
            position: relative;
            height: 100vh;
            overflow: hidden;
            }
            #dbErrorBody {
            position: absolute;
            top: 50%;
            left: 50%;
            margin-right: -50%;
            transform: translate(-50%, -50%);
            width: 600px;
            text-align: center;
            }
            #dbErrorBody h1 {
            margin-top: 5px;
            margin-bottom: 2px;
            }
            #dbErrorBody span {
            color: grey;
            }
            #dbErrorBody img {
            max-width: 468px;
            }
        </style>
        <title>Birux</title>
    </head>
    <body>
        <div id="dbErrorBody">
            <img src="/static/img/serverdown.svg" alt="Database Error">
            <h1>Проводятся технические работы</h1>
        </div>
    </bo