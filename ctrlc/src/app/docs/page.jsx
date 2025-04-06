'use client';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function APIDocs() {
  return (
    <div style={{ height: 'fit-content' }}>
      <SwaggerUI url="/swagger.yaml" />
    </div>
  );
}
