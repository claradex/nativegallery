<?php
use App\Core\Page;
?>

<!DOCTYPE html><!-- "' --></textarea></script></style></pre></xmp></a></audio></button></canvas></datalist></details></dialog></iframe></listing></meter></noembed></noframes></noscript></optgroup></option></progress></rp></select></table></template></title></video>
<meta charset="utf-8">
<meta name=robots content=noindex>
<title>Server Error</title>

<style>
	#tracy-error { all: initial; position: absolute; top: 0; left: 0; right: 0; height: 70vh; min-height: 400px; display: flex; align-items: center; justify-content: center; z-index: 1000 }
	#tracy-error div { all: initial; max-width: 550px; background: white; color: #333; display: block }
	#tracy-error h1 { all: initial; font: bold 50px/1.1 sans-serif; display: block; margin: 40px }
	#tracy-error p { all: initial; font: 20px/1.4 sans-serif; margin: 40px; display: block }
	#tracy-error small { color: gray }
	#tracy-error small span { color: silver }
</style>

<div id=tracy-error>
	<div>
		<h1>Server Error</h1>

		<p>Method <?=Page::method()?> not allowed for this page. Sorry!</p>

	</div>
</div>