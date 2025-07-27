import { Editor } from "@tinymce/tinymce-react";
import { Spin } from "antd";
import { useEffect } from "react";

export default function EditorTinyMCE({
  value,
  onChange,
  readOnly = false,
  placeholder = "Nhập nội dung...",
  onEditorLoad = () => {},
  isEditorLoaded = false,
}) {
  useEffect(() => {
    setTimeout(() => {
      onEditorLoad();
    }, 0);
  }, []);

  return (
    <Editor
      apiKey="fx49rmdn18jd3zfrobbyfbr58yfp0ocqiwz05edcqzihm070"
      value={value}
      init={{
        height: 200,
        menubar: false,
        plugins: [
          "advlist autolink lists link image charmap preview anchor",
          "searchreplace visualblocks code fullscreen",
          "insertdatetime media table code help wordcount",
        ],
        toolbar:
          "undo redo | formatselect | bold italic underline | \
           alignleft aligncenter alignright alignjustify | \
           bullist numlist outdent indent | link image | removeformat | help",
        placeholder,
        readonly: readOnly,
        content_style:
          "body { font-family:Roboto,Arial,sans-serif; font-size:15px }",
      }}
      onEditorChange={onChange}
      disabled={readOnly}
    />
  );
}
