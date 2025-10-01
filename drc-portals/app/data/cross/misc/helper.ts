'use client'

export function copyToClipboard(genesString: string) {
  navigator.clipboard.writeText(genesString);
}

export function enrich(options: any) {
    if (typeof options.list === 'undefined') {
        alert('No genes defined.');
        return;
    }

    var description = options.description || "",
        form = document.createElement('form'),
        listField = document.createElement('input'),
        descField = document.createElement('input');

    form.setAttribute('method', 'post');
    form.setAttribute('action', 'https://maayanlab.cloud/Enrichr/enrich');
    form.setAttribute('target', '_blank');
    form.setAttribute('enctype', 'multipart/form-data');
    listField.setAttribute('type', 'hidden');
    listField.setAttribute('name', 'list');
    listField.setAttribute('value', options.list);
    form.appendChild(listField);
    descField.setAttribute('type', 'hidden');
    descField.setAttribute('name', 'description');
    descField.setAttribute('value', description);
    form.appendChild(descField);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}