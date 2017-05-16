function appendToConsole(message) {
  $('#console').append(message + '\n')
}

function getSignedUrlPromise(fileName, fileType) {
  appendToConsole('Fetching signed URL')
  var url = `${SignedUrlEndpoint}/signedurl?name=${fileName}&type=${fileType}`

  return new Promise( (resolve, reject) => {
    $.getJSON(url)
      .done((data) => {
        appendToConsole('Received signed url:\n' + data.url)
        resolve(data.url)
      })
      .fail((error) => {
        console.error(error)
        reject(error.statusText)
      })
  })
}

function uploadFilePromise(url, file) {
  appendToConsole(`Uploading file (${file.size} bytes)`)
  
  return new Promise( (resolve, reject) => {
    $.ajax({
      url: url,
      type: 'PUT',
      data: file,
      processData: false,
      contentType: file.type
    })
    .done(() => resolve())
    .fail((error) => {
      console.error(error)
      reject(error.statusText)
    })
  })
}

$('#myForm').on('submit', function(e) {
  e.preventDefault()
  $('#uploadButton').prop('disabled', true)

  var file = $(this).find('input:file').prop('files')[0]
  if (file) {
    getSignedUrlPromise(file.name, file.type)
      .then((url) => uploadFilePromise(url, file))
      .then(() => appendToConsole('Upload complete!'))
      .catch((error) => appendToConsole('ERROR: ' + error))
  } else {
    appendToConsole('No file selected')
  }
})
