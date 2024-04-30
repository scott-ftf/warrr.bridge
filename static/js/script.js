// Declare some globals
const enable_debug = true;
let selectedNetwork = null;
let blockDisplayDetails = false;
const githubUrl = 'https://github.com/scott-ftf/warrr.bridge/claim';
const web3ToolUrl = "https://scott-ftf.github.io/warrr.bridge/warrr_tool"
const claimContractAddress = "0x6878ed87c682445fd4e8af8dae2ad98e48fe31e0"
const sunsetStartDate = "June 1st, 2024"

// Declare a global object to store claim information
let claim = {
  account: null,
  amount: null,
  sapling: null
};

// blacklisted wARRR and Sapling addresses
const blacklistAddresses = [
  //'zs18a3uzas40mj8nnhur82qvjgdcfyagark4jee2c5z9a6l30xzh48hls8ysf8q0wuycdye5646hd4'
];

// wARRR network details
const networks = {
  'BNB':{
    'chainId': '0x38',
    'rpcURL': 'https://bsc-dataseed1.binance.org/',
    'networkName': 'BSC Mainnet',
    'currencyName': 'BNB',
    'currencySymbol': 'BNB',
    'currencyDecimal': 18,
    'explorerURL': 'https://bscscan.com',
    'explorerLogo': 'static/img/etherscan.svg',
    'wordart': 'static/img/binance_wordart.svg',
    'exchange': 'https://pancakeswap.finance/swap?inputCurrency=BNB&outputCurrency=0xcdaf240c90f989847c56ac9dee754f76f41c5833',
    'exchangeLogo': 'static/img/pancake-logo.svg',
    'exchangeName': 'Pancake Swap',
    'addLiquidity': 'https://pancakeswap.finance/v2/add/0xCDAF240C90F989847c56aC9Dee754F76F41c5833/BNB',
    'removeLiquidity': 'https://pancakeswap.finance/v2/remove/0xCDAF240C90F989847c56aC9Dee754F76F41c5833/BNB',
    'stats':'https://pancakeswap.finance/info/tokens/0xcdaf240c90f989847c56ac9dee754f76f41c5833',
    'statsLogo':'',
    'unstake': 'https://bscscan.com/address/0x5502920b1c231d3b4d8f124658c447a72b72db4d#writeContract#F7',
    'stakingAddress':'0x5502920b1c231d3b4d8f124658c447a72b72db4d',
    'warrr':{
      'address':'0xcdaf240c90f989847c56ac9dee754f76f41c5833',
      'symbol':'wARRR',
      'decimals':8,
      'image':'https://bscscan.com/token/images/pirateblackchain_32.png',
      'type':'ERC20'
    },
    'warrrlp':{
        'address':'0xf01575e88e5c9e1fec464128096106155458e2a1',
        'symbol':'wARRR-LP',
        'decimals':18,
        'image':'https://bscscan.com/token/images/pirateblackchain_32.png',
        'type':'ERC20'
      }
  },
  'ETH':{
    'chainId': '0x1',
    'rpcURL': 'https://mainnet.infura.io/v3/',
    'networkName': 'Ethereum Mainnet',
    'currencyName': 'ETHER',
    'currencySymbol': 'ETH',
    'currencyDecimal': 18,
    'explorerURL': 'https://etherscan.io',
    'explorerLogo': 'static/img/etherscan.svg',
    'wordart': 'static/img/ethereum_wordart.svg',
    'exchange': 'https://app.balancer.fi/#/ethereum/trade/',
    'exchangeLogo': 'static/img/balancer-logo.svg',
    'exchangeName': 'Balancer',
    'addLiquidity': 'https://app.balancer.fi/#/ethereum/pool/0xb53f8f2907d8e5fed503f8ebce4433fb5c5beae200020000000000000000041e/add-liquidity',
    'removeLiquidity': 'https://app.balancer.fi/#/ethereum/pool/0xb53f8f2907d8e5fed503f8ebce4433fb5c5beae200020000000000000000041e/withdraw',
    'stats': 'https://app.balancer.fi/#/ethereum/pool/0xb53f8f2907d8e5fed503f8ebce4433fb5c5beae200020000000000000000041e',
    'statsLogo': '',
    'unstake': 'https://etherscan.io/address/0x5f083dd5dba10447239f09304b39c90851ca78cc#writeContract#F7',
    'stakingAddress': '0x5f083DD5DBA10447239F09304b39c90851cA78cc',
    'warrr':{
      'address': '0x057acee6DF29EcC20e87A77783838d90858c5E83',
      'symbol': 'wARRR',
      'decimals': 8,
      'image': 'https://bscscan.com/token/images/pirateblackchain_32.png',
      'type': 'ERC20'
    },
    'warrrlp':{
      'address': '0xB53f8F2907d8E5fED503f8ebCe4433FB5c5BEae2',
      'symbol': 'wARRR-LP',
      'decimals': 18,
      'image': 'https://bscscan.com/token/images/pirateblackchain_32.png',
      'type': 'ERC20'
    }
  }
};

// prints a debug message to the console when enabled
function debug(message) {
  if (enable_debug) {
    console.log(`[DEBUG] ${message}`)
  }
}

// closes all common error and other containers
function closeContainers() {
  // Hide and show appropriate containers
  document.getElementById('error_container').style.display = 'none';

  // Get the content element and reset its styles
  let content = document.getElementById("content");
  content.style.opacity = 1;
  content.style.pointerEvents = 'auto';

  // Check if the loadingIcon element exists
  let loadingIcon = document.getElementById("loadingIcon");
  if (loadingIcon) {
    // Remove the loadingIcon from the DOM if it exists
    loadingIcon.parentNode.removeChild(loadingIcon);
  }
}

// create and display error message
function createError(msg, reload) {
  const errorContainer = document.getElementById('error_container');
    
  // Clear previous error messages if any
  errorContainer.innerHTML = '';

  // Create the error message container
  const errorMessage = document.createElement('p');
  errorMessage.className = 'alert';
  errorMessage.innerHTML = msg;

  // Create the back button link
  const backButton = document.createElement('a');
  backButton.href = '';
  backButton.className = 'back_btn';
  backButton.id = 'backButton';

  // Create the button image
  const buttonImage = document.createElement('img');
  buttonImage.src = 'static/img/back_btn.svg';
  backButton.appendChild(buttonImage);

  // if relaod is true, send user back to the start of app instead of just closing error
  if (reload) {
      backButton.title = 'reload';
      backButton.onclick = function() {
          showNetworkPage(); 
          return false;
      };
  } else {
    backButton.title = 'close';
    backButton.onclick = function() {
        closeContainers(); 
        return false;
    };
  }

  // Append the elements to the container
  errorContainer.appendChild(errorMessage);
  errorContainer.appendChild(backButton);
}

// display web3 errors to user
function appError(msg, reload = false) {
  createError(msg, reload)

  // disable background
  var content = document.getElementById('content')
  content.style.opacity = 0.3;
  content.style.pointerEvents = 'none';

  // show the error
  const errorContainer = document.getElementById('error_container');
  errorContainer.style.display = "block";
}

// message to user if they need to install MetaMask
function installMM() {
  debug("metamask not found - ensure running as server")

  let messageHTML = `
    <p class="alert">No web3 wallet detected</p>
    <a class="btn imgbtn install_metamask" href="https://metamask.io/download/" target="_blank" rel="noopener">
      <img src="static/img/mm.svg" />
      Install Metamask
    </a>`;
  appError(messageHTML, false);
}

// Change the status indicator
function changeStatus() {
  const connectButton = document.getElementById("connectButton");
  const status = document.getElementById("status");
  const connection = document.getElementById("connection");

  connectButton.style.display = 'none';
  status.className = 'connected';
  connection.innerText = 'connected';
};

// Ask web3 wallet to change network
function changeNetwork(chainId) {
  const network = getNetworkByChainId(chainId);

  appError(`Please switch to ${network.networkName} network in MetaMask`, true);

  // Temporarily remove the event listener (to prevent running twice)
  window.ethereum.off('chainChanged', onNetworkChange);

  return new Promise(async (resolve, reject) => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: network.chainId }],
        });
        // Network switch successful
        resolve();
      } catch (switchError) {
        // Handle switch errors
        if (switchError.code === 4902) {
          // Add network to MetaMask
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: network.chainId,
                chainName: network.networkName,
                rpcUrls: [network.rpcURL],
                blockExplorerUrls: [network.explorerURL],
                nativeCurrency: {
                  name: network.currencyName,
                  symbol: network.currencySymbol,
                  decimals: network.currencyDecimal,
                }
              }],
            });
            // Network added successfully
            resolve();
          } catch (addError) {
            // Handle add error
            appError(addError.message);
            reject(addError);
          }
        } else {
          // Handle other switch errors
          appError(switchError.message, true);
          reject(switchError);
        }
      }
    } else {
      // MetaMask not detected
      const error = new Error("MetaMask not detected.");
      appError(error.message);
      reject(error);
    }
  }).finally(() => {
    // Reattach the event listener after the Promise is settled
    window.ethereum.on('chainChanged', onNetworkChange);
  });
}

// Get the chain data using chainId
function getNetworkByChainId(chainId) {
  const networkKeys = Object.keys(networks);
  for (const key of networkKeys) {
    if (networks[key].chainId === chainId) {
      return networks[key];
    }
  }
  return null; // return null if no matching chainId is found
}

// check if metamask network matches the requested network
async function checkNetwork() {
  try {
    const chainId = await web3.eth.getChainId();
    let currentChainId = "0x" + chainId.toString(16);

    const desiredChainId = networks[selectedNetwork].chainId;
    debug(`Requested chain ${desiredChainId}, current chain ${currentChainId}`);

    if (currentChainId !== desiredChainId) {
      await changeNetwork(desiredChainId);
    }
  } catch (error) {
    appError(error.message);
    throw error;
  }
}

// start the app
async function startApp() {
  try {
    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) {
      appError("User is not logged in to MetaMask");
      return;
    }
    changeStatus();
    displayAccountDetails();
  } catch (error) {
    appError(error.message);
  }
};

// check if web3 installed and ask for access
async function connectApp() {
  // Hide messages
  closeContainers()
  window.scrollTo({ top: 0, behavior: 'smooth' });

  try {
    if (window.ethereum) {
      // Modern dApp browsers
      window.web3 = new Web3(window.ethereum);
      startApp();
    } else if (window.web3) {
      // Legacy dApp browsers
      window.web3 = new Web3(web3.currentProvider);
    } else {
      // No web3 wallet detected
      installMM();
    }
  } catch (error) {
    appError(error.message);
  }
};

// helper function for common html
function generateHeadline(headline) {
    const contentDiv = document.getElementById('content');
    let balanceHeader = document.createElement("span");
    balanceHeader.className = "headline"
    balanceHeader.textContent = headline
    contentDiv.appendChild(balanceHeader) 
}

// helper function to creTE SOME SPANS
function createSpan(className, textContent) {
  const span = document.createElement('span');
  span.classList.add(className);
  span.textContent = textContent;
  return span;
}

// Show only the first and last characters of the address
function displayAddress(address) {

  // validate address
  if (!address || address.length < 42) {
      return "Invalid Ethereum address";
  }

  // format address
  const firstSixCharacters = address.substring(0, 6);
  const lastSixCharacters = address.substring(address.length - 6, address.length);

  let formatted_address = `${firstSixCharacters} ... ${lastSixCharacters}`;
  let explorerURL = networks[selectedNetwork]["explorerURL"];

  generateHeadline("account:")

  // Creating and appending the account link
  let accountLink = document.createElement('a');
  accountLink.textContent = formatted_address;
  accountLink.href = `${explorerURL}/address/${address}`;
  accountLink.target = '_blank';
  accountLink.rel = 'noopener';
  accountLink.className = 'account_address';
  document.getElementById("content").appendChild(accountLink);
}

// load all teh contrat abis
async function loadAbi() {
  try {
      // Fetch each ABI file from the server
      const responses = await Promise.all([
          fetch('abi/warrrlp_eth_abi.json'),
          fetch('abi/warrrlp_bnb_abi.json'),
          fetch('abi/warrr_abi.json'),
          fetch('abi/staking_abi.json')
      ]);

      // Convert each response to JSON
      const abi = await Promise.all(responses.map(response => {
          if (!response.ok) {
              throw new Error(`Failed to load ${response.url}: ${response.statusText}`);
          }
          return response.json();
      }));

      // Extract ABIs into an object
      const [warrrlpEth, warrrlpBnb, warrr, staking] = abi;
      return { warrrlpEth, warrrlpBnb, warrr, staking };
  } catch (error) {
      console.error("Error loading ABIs: ", error);
      throw error; 
  }
}

// get all of the warrr, warrrlp and staking balances
async function getBalances(account) {
  try {
      let network = networks[selectedNetwork];
      let warrrAddress = network["warrr"]["address"];
      let warrrlpAddress = network["warrrlp"]["address"];
      let stakingAddress = network["stakingAddress"];

      // get the abi files
      const abi = await loadAbi(); 

      // get warrr balance
      const warrr_abi = abi.warrr;
      const warrr_contract = new web3.eth.Contract(warrr_abi, warrrAddress);
      let warrr_balance_raw = await warrr_contract.methods.balanceOf(account).call();
      let warrr_decimals = network["warrr"]["decimals"]
      let warrr_balance = (warrr_balance_raw / 1e8).toFixed(warrr_decimals); 

      // get warrr LP balalnce
      let warrrlp_abi = abi.warrrlpBnb;
      if (selectedNetwork === "ETH") {
          warrrlp_abi = abi.warrrlpEth;
      }
      const warrrlp_contract = new web3.eth.Contract(warrrlp_abi, warrrlpAddress);
      let warrrlp_balance_raw = await warrrlp_contract.methods.balanceOf(account).call();
      let warrrlp_decimals = network["warrrlp"]["decimals"]
      let warrrlp_balance = (warrrlp_balance_raw / 1e18).toFixed(warrrlp_decimals); 

      // get staking balance
      const staking_abi = abi.staking;
      const staking_contract = new web3.eth.Contract(staking_abi, stakingAddress);
      const stakeInfo = await staking_contract.methods._stakeInfo(account).call();
      const stakedAmount = stakeInfo.amount;
      let staking_balance = (stakedAmount / 1e18).toFixed(warrrlp_decimals)
      
      debug(`Warrr Balance: ${warrr_balance}`);
      debug(`Warrrlp Balance: ${warrrlp_balance}`);
      debug(`Staking Balance: ${staking_balance}`);

      return {
          warrr: warrr_balance,
          warrrlp: warrrlp_balance,
          staking: staking_balance
      };
  } catch (error) {
      console.error('Failed to get balances:', error);
      throw error; 
  }
}

// display results from teh validation steps
function validationResult(msg, pass) {
  // Find the content div by its ID
  const validationContainer = document.getElementById('validation-container');

  // Create the first line
  const validation = document.createElement('p');
  validation.className = "validation-result";

  // Create and append the result span
  let result = document.createElement('span');
  if (pass) {
    result.className = "pass";
    result.textContent = "✔";
  } else {
    result.className = "fail";
    result.textContent = "✘";
  }
  validation.appendChild(result);

  // Append the validation message after the result span
  validation.appendChild(document.createTextNode(msg));

  // Append the validation element to the content div
  validationContainer.appendChild(validation);

  debug(msg)
}

// run teh account validity checks
function checkValidation(balance, account) {
  let network = networks[selectedNetwork]
  let checksFailed = null;

  generateHeadline("validation:");

  let validationContainer = document.createElement("div");
  validationContainer.setAttribute("id", "validation-container");
  const contentDiv = document.getElementById('content');
  contentDiv.appendChild(validationContainer)

  // Ensure there is a wARRR balalnce
  if (balance.warrr <= 0) {
    validationResult("No wARRR balance detected", false)
    checksFailed = true;
    let messageHTML = `
      <p class="alert">No wARRR Balane Detected</p>
      <p style="color:#fff">
      Verify the correct network and address is selected in MetaMask, and that the account is connected to this app.
      </p>
      <p style="margin-top:30px;">Selected Address:</p>
      <span style="color:#fff;">${account}</span> 
      <a class="btn imgbtn" style="margin-top:40px" href="${network['explorerURL']}/token/${network['warrr']['address']}?a=${account}" target="_blank" rel="noopener">
        <img src="${network['explorerLogo']}" />
        Check Explorer
      </a>`;
    appError(messageHTML, true)  
  } else {
    validationResult("wARRR balance found", true)
  }

  // Check for LP tokens
  if (balance.warrrlp > 1) {
    validationResult("wARRR LP detected", false)
    checksFailed = true;
    let messageHTML = `
      <p class="alert">wARRR LP Balance detected</p>
      <p style="color:#fff">
      ${balance.warrrlp} wARRR-LP was detected for this address. Please remove all wARRR from the liquidity 
      pool before claiming ARRR from the bridge.
      </P>
      <a class="btn imgbtn" style="margin-top:40px" href="${network['removeLiquidity']}" target="_blank" rel="noopener">
        <img src="${network['explorerLogo']}" />
        Remove Liquidity
      </a>`;
    appError(messageHTML, false) 
  } else { 
    validationResult("No Liquidity Position", true)  
  }

  // Check if Staking Balance
  if (balance.staking > 0) {
    validationResult("Staked wARRR detected", false)
    checksFailed = true;
    let messageHTML = `
      <p class="alert">Staked wARRR Detected</p>
      <p style="color:#fff">
      ${balance.staking} wARRR-LP was detected in the staking contract for this address. Please unstake wARRR-LP, 
      then remove from liquidity pool before claiming ARRR from the bridge.
      </P>
      <p style="margin-top:20px;">
      To unstake, click the link below to open the explorer. Click "connect to Web3", then click "write" to run the unstake function.
      </P>
      <a class="btn imgbtn" style="margin-top:40px" href="${network['unstake']}" target="_blank" rel="noopener">
        <img src="${network['explorerLogo']}" />
        Unstake
      </a>`;
    appError(messageHTML, false);   
  } else {
    validationResult("Staking not detected", true)
  } 

  // Check if any checks failed 
  // TODO: Any other validiyty checks needed?
  if (checksFailed) {
    validationResult("A validation check failed", false)
  } else {
    validationResult("Valididty checks passed", true)
  }
  
}

// display the balalnces
function displayBalance(balance) {
  generateHeadline("claim amount:")

  let balanceAmount = document.createElement("span");
  balanceAmount.className = "balance-amount"
  let formattedBalance = parseFloat(balance.warrr).toString();
  balanceAmount.innerHTML = `${formattedBalance} <span class="warrr-currency">wARRR</span>`;
  const contentDiv = document.getElementById('content');
  contentDiv.appendChild(balanceAmount)
}

// The actual logic to interact with the contract
function processClaim() {
  console.log("claim was validated, time to actually submit it")
  closeContainers()
  let content = document.getElementById("content")
  content.innerHTML = ""

  let todo = document.createElement("h2")
  todo.innerHTML = "TODO: Create actual contract submission logic"
  content.append(todo)

  // show loading icon
  let loadingIcon = getLoadingIcon()
  content.append(loadingIcon)
}

// make user confirm the disclaimer
function submitClaim() {
  // Check if all checkboxes are checked
  const checkboxes = document.querySelectorAll('.confirmations input[type="checkbox"]');
  let allChecked = true;
  checkboxes.forEach(checkbox => {
    if (!checkbox.checked) {
      // If a checkbox is not checked, change the color of its label to red
      const label = checkbox.parentNode;
      label.style.color = 'red';
      allChecked = false;
    }
  });

  if (allChecked) {
    // Call the processClaim function if all checkboxes are checked
    processClaim();
  }
}

// display teh confirmation page before submitting
function showConfirmClaimPage() {
  // clear content
  closeContainers()
  var content = document.getElementById("content")
  content.innerHTML = ""

  let claimAmount = parseFloat(claim.amount).toString();
  const saplingAddress = claim.sapling;
  const saplingLength = saplingAddress.length;

  // Determine the lengths of the three sections
  const prefixLength = 6;
  const suffixLength = 6;
  const mainLength = saplingLength - prefixLength - suffixLength;

  // Extract the three sections from sapling adress to highlight ends
  const saplingPrefix = saplingAddress.substring(0, prefixLength);
  const saplingMain = saplingAddress.substring(prefixLength, saplingLength - suffixLength);
  const saplingSuffix = saplingAddress.substring(saplingLength - suffixLength);

  // Create container
  const claimContainer = document.createElement('div');
  claimContainer.classList.add('claim-review');

  // page title
  const h2 = document.createElement('h2');
  h2.textContent = 'wARRR Bridge Claim Review';
  claimContainer.appendChild(h2);

  // Description
  const p1 = document.createElement('p');
  p1.textContent = 'Check the following details carefully before submitting';
  claimContainer.appendChild(p1);

  // Show warr balance
  const warrrHeader = createSpan('amounts-header', 'You are sending');
  const warrrAmount = createSpan('amounts', `${claimAmount} `);
  const warrrCurrency = createSpan('currency', 'wARRR');
  warrrAmount.appendChild(warrrCurrency);
  claimContainer.appendChild(warrrHeader);
  claimContainer.appendChild(warrrAmount);

  // show ARRR balalnce
  const arrrHeader = createSpan('amounts-header', 'You will receive');
  const arrrAmount = createSpan('amounts', `${claimAmount} `);
  const arrrCurrency = createSpan('currency', 'ARRR');
  arrrAmount.appendChild(arrrCurrency);
  claimContainer.appendChild(arrrHeader);
  claimContainer.appendChild(arrrAmount);

  // show sapling
  const saplingAddressHeader = createSpan('amounts-header', 'Your Pirate Chain receiving address');
  const saplingAddressContainer = document.createElement('p');
  saplingAddressContainer.classList.add('sapling-address-container');
  const saplingAddressPrefix = createSpan('sapling-address-highlight', saplingPrefix);
  const saplingAddressSpan = createSpan('sapling-address', saplingMain);
  const saplingAddressSuffix = createSpan('sapling-address-highlight', saplingSuffix);
  
  saplingAddressContainer.appendChild(saplingAddressPrefix);
  saplingAddressContainer.appendChild(saplingAddressSpan);
  saplingAddressContainer.appendChild(saplingAddressSuffix);
  claimContainer.appendChild(saplingAddressHeader);
  claimContainer.appendChild(saplingAddressContainer);

  // disclaimer
  const disclaimer = document.createElement('p');
  disclaimer.classList.add('disclaimer');
  disclaimer.innerHTML = `Submitting this claim is final. To prevent fraud, no corrections or changes 
  can be made.<br /><u>KEEP YOUR PIRATE CHAIN PRIVATE KEY SAFE!</u>`;
  claimContainer.appendChild(disclaimer);

  // confirmation section
  const confirmations = document.createElement('p');
  confirmations.classList.add('confirmations');
  const ul = document.createElement('ul');
  const checkboxesText = [
    'I double checked, and confirm the receiving address is correct',
    'I understand I am sending wARRR to a contract and it cannot be returned after it is sent.',
    'I understand ARRR payments are not immediate and all claim payments will be made no earlier than 30 days after the end of the claim period.'
  ];
  checkboxesText.forEach(text => {
    const li = document.createElement('li');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    const label = document.createElement('label');
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(` ${text}`));
    li.appendChild(label);
    ul.appendChild(li);
  });
  confirmations.appendChild(ul);
  claimContainer.appendChild(confirmations);

  // Create button
  const button = document.createElement('button');
  button.classList.add('btn');
  button.textContent = 'Send claim';
  button.onclick = submitClaim; 
  claimContainer.appendChild(button);

  content.append(claimContainer)
}

// QUCIK CONFIRMATION CHECK FOR BALALNCE AND VALID SAPLING ADDRESS
function confirmClaim() {
  // Get the button element
  const button = document.getElementById("claimbtn");

  // Check that there is a wARRR balance
  if (claim.amount === null || claim.amount <= 0) {
    appError("wARRR is required to place a claim", false)
    return;
  }

  // Check if address is valid
  const address = document.getElementById('sapling-input').value;
  let validSapling = validateSaplingPaymentAddress(address)
  if (!validSapling) {
    debug("valid address required")
    return;
  }

  // Check if the button is disabled (has the disabled-button class)
  if (button.classList.contains("disabled-button")) {
      // Button is disabled, so prevent the function from executing
      debug("button disabled - check claim and sapling address are valid")
      return;
  }
  
  showConfirmClaimPage()
}

// show the errors below teh sapling input box
function saplingError(msg) {
  debug(msg)
  disableClaimButton()
  let errorContainer = document.getElementById("errorContainer")
  errorContainer.innerHTML = msg
}

// entry for checking sapling address
function saplingValid(address) {
  debug("valid sapling payment address")  
  saplingError(""); 
  claim.sapling = address;
  enableClaimButton()
  return true;
}

// sapling address validity checks
function validateSaplingPaymentAddress(address) { 
  const HRP_REGEX = /^zs$/;
  const INVALID_CHAR_REGEX = /[ib1o]/g;

  // Trim whitespace from the address
  address = address.trim();

  // Check a address was submitted
  if (!address) {
    saplingError("A valid sapling address is required.");
    return false;
  }

  // Get HRP and data parts
  const parts = address.split('1');
  const [hrp, data] = parts;

  // Check that the address starts with zs
  if (!HRP_REGEX.test(hrp)) {
      saplingError("Invalid address format. Sapling addresses start with zs1...");
      return false;
  }
  
  // Sapling payment addresses must have at least 1 seperator
  if (!address.includes('1')) {
    saplingError("Separator '1' missing. Sapling addresses start with zs1...");
    return false; 
  }
  
  // sapling addresses should not have more than one seprator (since the HRP does not have a 1)
  if (parts.length !== 2) {
    saplingError("More than one separator '1' found");
    return false; 
  }
  
  // Check data part does not include characters "i", "b", "1", "o" and uses at least 6 of the allowed characters
  const invalidChars = data.match(INVALID_CHAR_REGEX);
    if (invalidChars) {
      saplingError("Invalid data part characters found:", invalidChars);
      return false; 
  }

  // Check if the address has the correct length (78 characters)
  if (data.length < 75) {
    saplingError(`Invalid address length. Sapling addresses have 78 characters (${address.length} entered)`);
    return false;
  }

  // check if addres is blacklisted
  if (blacklistAddresses.includes(address)) {
    saplingError("This address is is blacklisted, please check the correct address was enetered.");
    return false;
  } 
  
  saplingValid(address)
  return true;
}

// if validity passes, enable claim button
function enableClaimButton() {
  let claimButton = document.getElementById("claimbtn");
  let claimBtnIcon = document.getElementById("claimBtnIcon");

  // Check if the button has the disabled-button class
  if (claimButton.classList.contains("disabled-button")) {
      // If it does, remove the class
      claimButton.classList.remove("disabled-button");
  }

  // update icon and title
  claimButton.title = "Submit bridge wARRR claim!";
  claimBtnIcon.textContent = "✔"; 
}

// disable claim button until claim is valid
function disableClaimButton() {
  let claimButton = document.getElementById("claimbtn");
  let claimBtnIcon = document.getElementById("claimBtnIcon");

  // Check if the button already has the disabled-button class
  if (!claimButton.classList.contains("disabled-button")) {
      // If not, add the class
      claimButton.classList.add("disabled-button");
  }

  // Set teh icon and title
  claimButton.title = "Valid account and sapling address required before submitting claim";
  claimBtnIcon.textContent = "✖"; 
}

// generate the button to submit claim
function generateSubmitButton() {
  // Create the button element
  const claimButton = document.createElement("button");
  claimButton.setAttribute("onclick", "confirmClaim()");
  claimButton.setAttribute("id", "claimbtn");

  claimButton.textContent = "Review Claim";
  const claimBtnIcon = document.createElement("span");
  claimBtnIcon.setAttribute("id", "claimBtnIcon");  

  // Append the icon span to the button
  claimButton.insertBefore(claimBtnIcon, claimButton.firstChild);
  const contentDiv = document.getElementById("content");

  // Append the button
  contentDiv.appendChild(claimButton);

  // set button disabled by default
  disableClaimButton()
}

// create and display the sapling input feild
function generateSaplingInput(balance) {
  const contentDiv = document.getElementById('content');

  generateHeadline("claim payment address:");

  let formattedBalance = parseFloat(balance.warrr).toString();
  let msg = `Enter your Pirate Chain sapling address where the ${formattedBalance} ARRR will be sent`;

  let saplingDesc = document.createElement("p");
  saplingDesc.className = "sapling-desc";
  saplingDesc.textContent = msg;
  contentDiv.appendChild(saplingDesc);

  let saplingInput = document.createElement("input");
  saplingInput.type = "text";
  saplingInput.placeholder = "Pirate Chain Sapling Address (zs1...)";
  saplingInput.setAttribute("id", "sapling-input");
  contentDiv.appendChild(saplingInput);

  // Create the error container
  let errorContainer = document.createElement("div");
  errorContainer.setAttribute("id", "errorContainer");
  contentDiv.appendChild(errorContainer);

  // Add event listener to input for the input event
  saplingInput.addEventListener("input", function() {
    validateSaplingPaymentAddress(this.value); 
  });
}

// Display details about the selected account
async function displayAccountDetails() {
  let content = document.getElementById("content")
  content.innerHTML = "";
  let loadingIcon = getLoadingIcon()
  content.append(loadingIcon)

  // check we are on teh correct network in cas eit changed
  await checkNetwork()

  // close any open containers and reset the content
  closeContainers()
  updateNetworkLogo()  
  content.innerHTML = "";

  // get account address
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  const account = accounts[0];  
  debug(`Account selected: ${account}`);
  displayAddress(account);

  // show loading icon while we get balalnces
  content.append(loadingIcon)

  // get balances
  let balance = await getBalances(account);

  // update global balalnce and address for later
  claim.amount = balance.warrr
  claim.account = account

  // check account is valid
  checkValidation(balance, account)

  // display balance and claim form
  loadingIcon.parentNode.removeChild(loadingIcon);
  displayBalance(balance)
  generateSaplingInput(balance)
  generateSubmitButton()
};

// listen for wallet to switch account
window.ethereum.on('accountsChanged', function (accounts) {
  displayAccountDetails();
});

// Define the event handler function
function onNetworkChange(networkId) {

  if (blockDisplayDetails) {
    blockDisplayDetails = false;
    return false
  }
    
  let network = getNetworkByChainId(networkId);
  if (network) {
    selectedNetwork = network["currencySymbol"];
    displayAccountDetails();
  } else {
    appError("Only Ethereum and Binance Smart Chain networks are compatible with this tool", true);
  }
}

// Attach the event handler to detect network change in metamask
window.ethereum.on('chainChanged', onNetworkChange);

// Create and return a HTML loading icon as a DOM element
function getLoadingIcon() {
  const groups = 6;
  const sectors = 6;

  let loadingIcon = document.createElement('div')
  loadingIcon.setAttribute("id", "loadingIcon");

  // Create the external container
  let hexagon = document.createElement("div");
  hexagon.className = "hexagon";

  // Add the groups to the container
  for(let i = 0; i < groups; i++){
    let group = document.createElement("div");
    group.className = "hexagon__group";

    // Add sectors to the groups
    for(let j = 0; j < sectors; j++){
      let sector = document.createElement("div");
      sector.className = "hexagon__sector";
      group.appendChild(sector);
    }
    hexagon.appendChild(group);
  }

  loadingIcon.append(hexagon)

  return loadingIcon; 
}

// add the reload button
function appendreloadButton() {
  // Check if already exists
  if (document.getElementById('reloadButton')) {
    console.log("Reload button already exists.");
    return; 
  }

  var link = document.createElement('a');
  link.href = "";  
  link.id = "reloadButton";
  link.textContent = "x"; 
  link.onclick = function() {
      showNetworkPage();  
      return false; 
  };

  // Insertbefore the github
  var githubElement = document.getElementById('github'); 
  githubElement.parentNode.insertBefore(link, githubElement);

  // Fade in effect
   setTimeout(function() {
    link.style.visibility = 'visible';
    link.style.opacity = 1;
  }, 10); // Delay so CSS recognizes 'visibility' change

}

// change the logo when network is changed
function updateNetworkLogo() {
  var header = document.querySelector('header');

  // Check if the network logo already exists and has the correct source
  let existingLogo = document.getElementById("network_logo");
  let desiredSource = networks[selectedNetwork]["wordart"];
  
  if (existingLogo && existingLogo.src === desiredSource) {
      console.log("Network logo is already up to date.");
      return; 
  }

  // Clear the header content
  header.innerHTML = "";

  // Create a new network logo or reuse the existing one
  let networkLogo = existingLogo || document.createElement("img");
  networkLogo.setAttribute("id", "network_logo");
  networkLogo.src = desiredSource;
  header.append(networkLogo);

  // Fade in the logo
  setTimeout(function() {
      networkLogo.style.visibility = 'visible';
      networkLogo.style.opacity = 1;
  }, 10); // Delay to ensure CSS recognizes 'visibility' change
}

// show the wallet connection page
function showConnectPage() {
  debug("Connect wallet")

  // add reload button if it doesnt yet exist
  appendreloadButton()
  updateNetworkLogo()

  // close containers and remove the content
  closeContainers()
  var content = document.getElementById("content")
  content.innerHTML = ""

  // connection container
  var connectionContainer = document.createElement('section');
  connectionContainer.id = 'connection_container';
  connectionContainer.style.display = "block";

  // connection div
  var connectionDiv = document.createElement('div');
  connectionDiv.className = 'connection';

  // web3 span
  var web3 = document.createElement('span');
  web3.className = 'success';
  web3.innerHTML = 'web3: ';

  // connection status
  var connectionStatus = document.createElement('span');
  connectionStatus.id = 'connection';
  connectionStatus.textContent = 'disconnected';

  // status indicator
  var statusIndicator = document.createElement('span');
  statusIndicator.id = 'status';
  statusIndicator.className = 'disconnected';
  statusIndicator.textContent = '・';

  // Append
  web3.appendChild(connectionStatus);
  web3.appendChild(statusIndicator);
  connectionDiv.appendChild(web3);

  // Create the connect button
  var connectButton = document.createElement('button');
  connectButton.type = 'button';
  connectButton.id = 'connectButton';
  connectButton.onclick = function() { connectApp(); };
  connectButton.textContent = 'Connect Wallet';

  // Append to the container 
  connectionContainer.appendChild(connectionDiv);
  connectionContainer.appendChild(connectButton);

  // Append the container before the content section
  var content = document.getElementById('content');
  content.parentNode.insertBefore(connectionContainer, content);
}

// updates the selected network and moves to teh connection page
async function selectNetwork(network) {
  debug(`Network updated from ${selectedNetwork} to ${network}`)
  selectedNetwork = network;
  var connectionElement = document.getElementById('connection');

  // Check if connection exists and skip connection page
  if (connectionElement && connectionElement.textContent.trim().toLowerCase() === 'connected') {
    debug("Already connected, skipping connect page")
    blockDisplayDetails = true;
    displayAccountDetails();
  } else {
    showConnectPage();
  } 
}

// show the network selection page
function showNetworkPage() {
  debug("choose the network...")
  closeContainers()

  // Create a div for the buttons
  var buttonsDiv = document.createElement("div");
  buttonsDiv.className = "buttons";

  // choose netowrk
  var span = document.createElement("span");
  span.className = "choosenet";
  span.textContent = "choose the network";
  buttonsDiv.appendChild(span);

  // Create the Binance button
  var btnBinance = document.createElement("button");
  btnBinance.id = "btn-binance";
  btnBinance.className = "btn imgbtn";
  btnBinance.onclick = function() { selectNetwork('BNB'); };
  btnBinance.innerHTML = '<img src="static/img/binance_logo.svg" /> Binance';
  buttonsDiv.appendChild(btnBinance);

  // Create the Ethereum button
  var btnEthereum = document.createElement("button");
  btnEthereum.id = "btn-ethereum";
  btnEthereum.className = "btn imgbtn";
  btnEthereum.onclick = function() { selectNetwork('ETH'); };
  btnEthereum.innerHTML = '<img src="static/img/ethereum_logo.svg" /> Ethereum';
  buttonsDiv.appendChild(btnEthereum);

  // Append the buttons
  var contentDiv = document.getElementById("content");
  contentDiv.innerHTML = ""
  contentDiv.appendChild(buttonsDiv);    
}

// Create the header at the top of the page
function createHeader() {
  debug("Generating Header")
  var header = document.createElement('header');

  // logo
  var img = document.createElement('img');
  img.className = 'logo';
  img.src = 'static/img/pirate_logo.svg';

  // title
  var titleSpan = document.createElement('span');
  titleSpan.className = 'title';
  var warrrSpan = document.createElement('span');
  warrrSpan.className = 'warrr';
  warrrSpan.textContent = 'wARRR';

  // wARRR
  titleSpan.appendChild(warrrSpan);

  // Add totle wording
  titleSpan.append(' bridge claim tool');

  header.appendChild(img);
  header.appendChild(titleSpan);

  return header
}

// genrate teh page html for the mani content and footer sections
function createPage() {
  debug("Generating Page Structure")

  // Create the content div
  var content = document.createElement('section');
  content.setAttribute("id", "content");

  // Create the footer
  let footer = document.createElement('footer')

  // create error container
  let errorContainer = document.createElement('div')
  errorContainer.setAttribute("id", "error_container");
  footer.append(errorContainer)

  // create readme
  let github = document.createElement('a');
  github.setAttribute('title', 'Go to the github repo');
  github.setAttribute('class', 'github');
  github.setAttribute('id', 'github');
  github.setAttribute('href', githubUrl);
  github.setAttribute('target', '_blank');
  github.setAttribute('rel', 'noopener');

  // Create the object element
  var githubImg = document.createElement('img');
  githubImg.src = 'static/img/github.svg';
  github.appendChild(githubImg);
  footer.append(github)

  // Get the script element
  var scriptElement = document.querySelector('script[src="static/js/script.js"]');

  // Insert the new element before the script element
  scriptElement.parentNode.insertBefore(content, scriptElement);
  scriptElement.parentNode.insertBefore(footer, scriptElement);

}

// Generate the introduction and instructions landing page
function createIntroduction() {
  debug("Generating the introduction")
  let introduction = document.createElement('div')
  introduction.setAttribute('id', 'introduction');
  introduction.className = "introduction"

  let s1 = document.createElement('section')
  s1.innerHTML = `<h2>INTRODUCTION</h2>
  <p>
    wARRR was created as a low friction path from Ethereum & Binance Smart Chains 
    to the Pirate Chain network. This functionality was provided by a bridge built 
    and maintained via a partnership with Aureus Trading, where 1 ARRR always equaled
    1 wARRR.
  </p>
  
  <p>
    On July 30th of 2023, Aureus suffered an attack and made the decision to cease 
    bridge operations. Alternative solutions for a replacement service where considered, 
    but ultimately trusted custodial brides are a notorius weak point succeptable to attack. 
    Instead, new solutions are being developed with our friends from the Verus network. 
    The vARRR PBaaS chain provides this cross-chain functionality via atomic swaps and Verus' 
    trustless and non-custodial Ethereum Bridge.
  </p> 
    
  <p>
    While wARRR itself was not affected, without the underlying
    bridge functionality, the purpouse of wARRR no longer exists. For that reason, it 
    is with a heavy heart the team as made the decison to sunset wARRR.
  </p>`

  let s2 = document.createElement('section')
  s2.innerHTML = `<h2>SUNSET OUTLINE</h2>
  <p>
    An anonymous community member has donated ARRR to ensure all wARRR holders can 
    claim 1 ARRR for every wARRR token they hold. As most users have already exited wARRR 
    following the announcements, the team currently controls over 99% of all circulating
    wARRR. This bridge claim app will facilitate wARRR holders sending back as much outstanding
    wARRR as possible. 
  </p>
  <p>
    Once the claim period is complete, all controlled wARRR will be burnt. 
    Following the burn, the token contract ownerships will be renounced, ensuring 
    no future changes can be made. At the end of this process wARRR will be unsupported and 
    effectively sunset with as many tokens as possible removed from circulation.  
  </p>`

  let s3 = document.createElement('section')
  s3.innerHTML = `<h2>OPTIONS</h2>
  <p>wARRR holders have three options:
    <ul>
      <li><strong>Claim ARRR</strong> - Use this bridge claim app to send wARRR and receive an equivelant amount of ARRR</li>
      <li><strong>Donate wARRR</strong> - send back any wARRR for the burn to help remove wARRR from circulation</li>
      <li><strong>Do nothing</strong> - Any wARRR not exchanged or burned, will be UNSUPPORTED.
      We strongly advise choosing one of the two other options</li>
    </ul>
  </p>`

  let s4 = document.createElement('section')
  s4.innerHTML = `<h2>SUNSET SCHEDULE</h2>
  <p>
    The wARRR Sunset program wil begin ${sunsetStartDate}
    <ul>
      <li><strong>Claim Period</strong> - 60 days to submit claims or return wARRR</li>
      <li><strong>ARRR refunds</strong>  - 30 days after the claim period, ARRR payments will be sent to fullfil all claims</li>
      <li><strong>wARRR Burn</strong>  - 30 days later all controlled wARRR will be burnt</li>
      <li><strong>Relinquish Ownership</strong>  - 30 days later ownership of contracts will be renounced</li>
    </ul>
    Following these steps, there will be no ability for exceptions or any other additional claims to be made.
    No person will any longer have control of the wARRR token contracts.
  </p>`


  let s5 = document.createElement('section')
  s5.innerHTML = `<h2>INSTRUCTIONS</h2>
  <p>
    <strong>STEP 1</strong><br />
    If staking, unstake and remove all funds from the Liquidity pools. The following 
    web3 tool can be used to faclitate those operations:<br />
    <a href="${web3ToolUrl}" class="btn imgbtn" title="Go to web3 tool" target="_blank" rel="noopener">
      <img src="static/img/p.svg" />  
      wARRR Web3 Tool
    </a>
  </p>

  <p>
    <strong style="margin-top:30px;display:block;">STEP 2</strong><br />
    If wARRR is held in multiple accounts, use metamask to combine all wARRR balances into a single
     account so only one claim is made.<br />
    <a class="btn imgbtn install_metamask" href="https://metamask.io/download/" target="_blank" rel="noopener">
      <img src="static/img/mm.svg" />
      Install Metamask
    </a>
  </p>

  <p>
  <strong style="margin-top:30px;display:block;">STEP 3</strong><br />
    Donate wARRR -  If <u><i><b>NO</b> ARRR IS REQUESTED IN RETURN</i></u>, send wARRR to this address to be 
    included in the burn and help the team remove wARRR from circulation: <br />
    <span class="donationAddy">${claimContractAddress}</span>
  </p>
  <p style="color:#dec477;text-align:center;margin:20px auto;">-OR-</p>
  <p>
    BRIDGE CLAIM - To recieve ARRR in exchange for any wARRR holdings, use this web3 app to submit that claim and intiate the transfer:</p>
    <strong style="display:block;text-align:center;margin: 20px auto 0px;">wARRR Bridge Claim Tool:</strong>
    <button class="btn claimbtn" onClick="showNetworkPage()">Launch Bridge Claim App</button>
  </p>`

  introduction.append(s1)
  introduction.append(s2)
  introduction.append(s3)
  introduction.append(s4)
  introduction.append(s5)

  return introduction
}

// show the main landing page
function showLandingPage() {
  closeContainers()
  let content = document.getElementById("content")
  content.innerHTML = ""

  let header = createHeader()
  content.parentNode.insertBefore(header, content);

  let introduction = createIntroduction()
  content.append(introduction)
}

// on page load, begin generating the html
document.addEventListener('DOMContentLoaded', function() {
  createPage()
  showLandingPage()
});