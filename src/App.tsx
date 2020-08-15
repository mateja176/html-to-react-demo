// @ts-ignore
import HtmlToReact, { Parser } from 'html-to-react';
import React from 'react';
import './App.css';

const htmlInput = `
<script>
  console.log('start')
</script>
<div>
  <h1>Title</h1>
  <p>Paragraph</p>
  <h1 id="another" onclick="console.log(event.target)">Another title</h1>
</div>
`;

const isValidNode = function () {
  return true;
};

// Order matters. Instructions are processed in the order they're defined
const processNodeDefinitions = new HtmlToReact.ProcessNodeDefinitions(React);
const processingInstructions = [
  {
    // scripts
    shouldProcessNode: function (node: any) {
      return node.type === 'script';
    },
    processNode: function (node: any) {
      eval(node.children[0].data);

      return null;
    },
  },
  {
    // event listeners
    shouldProcessNode: function (node: any) {
      return (
        !!node.attribs &&
        Object.keys(node.attribs).some((key) => key.startsWith('on'))
      );
    },
    processNode: function (node: any, children: any) {
      return React.createElement(
        node.name,
        Object.fromEntries(
          Object.entries(node.attribs).map(([key, value]) => {
            const newKey = `on${key
              .slice(2)
              .charAt(0)
              .toUpperCase()}${key.slice(3)}`;
            return key.startsWith('on')
              ? [newKey, eval(`() => { ${value} }`)]
              : [newKey, value];
          }),
        ),
        children,
      );
    },
  },
  {
    // Anything else
    shouldProcessNode: function (node: any) {
      return true;
    },
    processNode: processNodeDefinitions.processDefaultNode,
  },
];
const htmlToReactParser = new Parser();
const reactElement = htmlToReactParser.parseWithInstructions(
  htmlInput,
  isValidNode,
  processingInstructions,
);

function App() {
  return <div className="App">{reactElement}</div>;
}

export default App;
