try {
  console.log("Testing require('../src/pages/textToSpeechPillar')...");
  require('../src/pages/textToSpeechPillar');
  console.log("PASS: textToSpeechPillar");

  console.log("Testing require('../src/pages/textToSpeechSubpages')...");
  require('../src/pages/textToSpeechSubpages');
  console.log("PASS: textToSpeechSubpages");

  console.log("Testing require('../src/pages/textToSpeechBlogHub')...");
  require('../src/pages/textToSpeechBlogHub');
  console.log("PASS: textToSpeechBlogHub");

  console.log("Testing require('../src/api/seoHandler')...");
  require('../src/api/seoHandler');
  console.log("PASS: seoHandler");

  console.log("Testing require('../src/api/contentHandler')...");
  require('../src/api/contentHandler');
  console.log("PASS: contentHandler");

  console.log("Testing require('../api/index')...");
  require('../api/index');
  console.log("PASS: api/index");

  console.log("ALL FILES VERIFIED SUCCESSFULLY WITH 0 SYNTAX ERRORS!");
} catch (err) {
  console.error("FAIL: SYNTAX OR REQUIRE ERROR DETECTED!");
  console.error(err);
  process.exit(1);
}
