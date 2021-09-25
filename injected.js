console.log(`injected.js has been initiated`);

const pp = stuff => JSON.stringify(stuff, null, 2);

// disable locking down object properties for fiberNode (and any other) objects
Object.preventExtensions = () => true;

// declare fiberRoot object
let fiberRoot;

const origProxy = Proxy;

const objectHandler = {
  get: (target, prop, receiver) => {
    console.log(`target: ${target}, prop: ${prop}, receiver: ${receiver}`);
    Reflect.get(...arguments);
  }
};

const proxyHandler = {
  construct: (target, args) => {
    let caller;
    
    try {
      throw new Error();
    } catch(err) {
      // console.log(`err.stack is ${pp(err.stack)}`);
      caller = err.stack.split("at ")[2].split(" (")[0];
    }
    
    // console.log(`Proxy caller is: ${caller} and params are ${pp(args)}`)
    // console.dir(args)
    // console.dir(Reflect.ownKeys(args[1]));
    // console.dir(args[1]['f'])
    // console.dir(args[1].constructor)
    // console.log(Reflect.ownKeys(args[-1]));
    // args.forEach((arg) => {
    //   console.log(`arg is ${arg}`);
    //   arg = new Proxy(arg, objectHandler);
    // });
    // // return new origProxy(target, args, receiver);
    return Reflect.construct(target, args);
  }
};

Proxy = new origProxy(origProxy, proxyHandler);

// Proxy = (target, args, receiver) => {
//   console.log(`target: ${target}, args: ${args}, receiver: ${receiver}`);
// Proxy = () => {
//   console.log(`params are: ${arguments}`);
//   // return new origProxy(arguments);
// };
// Proxy.prototype = origProxy.prototype;

// generateDeValtioID
const generateDeValtioID = (fiberNode) => {
  
  let width = fiberNode.index;

  // check if fiberNode already has deValtioID
  fiberNode.deValtioID ? currentID = deValtionID : currentID = null;

  // func to check if currentID and generatedID mismatch. If they do, throw an error
  const checkMismatch = function(newID) {
    if (currentID && currentID !== newID) {
      throw new Error('Generated ID mismatch. Existing ID is ${currentID} and generated ID is ${newID');
    }
  }
  
  // detect fiberRoot (tag is 3 and return property is null)
  if (fiberNode.return === null && fiberNode.tag === 3 && fiberNode.index === 0) {
    fiberNode.deValtioID = '0,0';
    checkMismatch(fiberNode.deValtioID);
    return fiberNode.deValtioID;
  }

  // throw exception if return property has not been set and node isn't fiberRoot
  if (fiberNode.return === null) {
    throw new Error('node is not fiberRoot but return property is null.');
  }

  // get current depth by getting the depth of return and incrementing by one
  // let depth = Number(fiberNode.return.deValtioID.split(':').pop().split(',')[0]) + 1;

  // width is just the index property of the fiberNode
  // let width = fiberNode.index;

  // detect if current node is child of sibling
  if (fiberNode.return.deValtioID && fiberNode.return.index > 0) {
    const returnName = fiberNode.return.deValtioID;
    fiberNode.deValtioID = `${returnName}:1,${width}`;
    checkMismatch(fiberNode.deValtioID);
    return fiberNode.deValtioID;
  }

  // get depth by parsing name of return, adding one to the last depth, and appending the width
  const splitReturnName = fiberNode.return.deValtioID.split(':');
  const returnNodeDepth = Number(splitReturnName.pop().split(',')[0]);
  const newName = splitReturnName.join(':') ? 
    splitReturnName.join(':') + ':' + (returnNodeDepth + 1) + ',' + width :
    (returnNodeDepth + 1) + ',' + width;
    
  fiberNode.deValtioID = newName;
  checkMismatch(fiberNode.deValtioID);
  return fiberNode.deValtioID;
  
}

document.onreadystatechange = () => {
  if (document.readyState === 'complete') {

    const reactRoots = [];
    document.querySelectorAll('*').forEach(node => {
      if (node._reactRootContainer) reactRoots.push(node);
    });

    if (reactRoots[0]) {
      console.log(`React Root Found`);
      fiberRoot = reactRoots[0]._reactRootContainer._internalRoot.current;
    };

    //tree parsing part.

    // func to get component (i.e. constructor) name
    // this returns one or two letter names in prod mode but
    // this can be adapted to still get proper component names if the site uses source maps
    // and we add source map parsing
    const getFiberNodeName = (node) => {
      // root node
      if (node.tag === 3) return 'fiberRoot';
      // functional or class component
      if (node.tag === 0 || node.tag === 1) return node.type.name;
      // host component (renders to browser DOM)
      if (node.tag === 5) {
        return node.stateNode.className ? `${node.type}.${node.stateNode.className}` : node.type;
      }
      // everything else
      if (typeof node.type === 'string') return node.type;
      if (typeof node.type === 'function') return node.type.name;
      if (typeof node.type === 'symbol') return node.type.toString();
    };
    

    const deValtioNodes = [];

    function devaltioNode(fiberNode) {
      this.tag = fiberNode.tag;
      this.deValtioID = fiberNode.deValtioID;
      this.index = fiberNode.index;
      this.componentName = getFiberNodeName(fiberNode);
      this.hasProps = fiberNode.memoizedProps ? true : false;
      this.hasState = fiberNode.memoizedState ? true : false;
    };
    
    // climb initial Tree, add valtioID to fiberNode properties
    // we should only need to do this once per page load and, after that,
    // if we hijack the fiberNode constructor we can have the React Reconciler
    // generate devaltioNodes on the fly.

    // valtioID format:
    // 0,0:
    
    const climbTree = (fiberNode = fiberRoot) => {
      // generate deValtioID
      generateDeValtioID(fiberNode);

      // add current node to deValtioNodes array
      deValtioNodes.push(new devaltioNode(fiberNode));

      // climb sibling
      if (fiberNode.sibling) climbTree(fiberNode.sibling);

      // climb child
      if (fiberNode.child) climbTree(fiberNode.child);
    }

    climbTree()
    console.log(deValtioNodes);

  }
};