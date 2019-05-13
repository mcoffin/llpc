#version 450

layout(set = 0, binding = 0) uniform sampler1D samp1D;
layout(set = 1, binding = 0) uniform sampler2D samp2D[4];
layout(set = 0, binding = 1) uniform sampler3D samp3D;
layout(set = 0, binding = 2) uniform sampler2DRect samp2DRect;
layout(set = 0, binding = 3) uniform sampler1DArray samp1DArray;
layout(set = 2, binding = 0) uniform sampler2DArray samp2DArray[4];

layout(set = 3, binding = 0) uniform Uniforms
{
    int index;
};

layout(location = 0) out vec4 fragColor;

void main()
{
    vec4 f4 = texelFetchOffset(samp1D, 2, 3, 4);
    f4 += texelFetchOffset(samp2D[index], ivec2(5), 6, ivec2(7));
    f4 += texelFetchOffset(samp3D, ivec3(1), 2, ivec3(3));
    f4 += texelFetchOffset(samp2DRect, ivec2(4), ivec2(5));
    f4 += texelFetchOffset(samp1DArray, ivec2(5), 6, 7);
    f4 += texelFetchOffset(samp2DArray[index], ivec3(1), 2, ivec2(3));

    fragColor = f4;
}
// BEGIN_SHADERTEST
/*
; RUN: amdllpc -spvgen-dir=%spvgendir% -v %gfxip %s | FileCheck -check-prefix=SHADERTEST %s
; SHADERTEST-LABEL: {{^// LLPC}} SPIRV-to-LLVM translation results
; SHADERTEST-LABEL: {{^// LLPC}}  SPIR-V lowering results
; SHADERTEST: call <8 x i32> {{.*}} @llpc.call.desc.load.resource.v8i32(i32 0, i32 0, i32 0, i1 false)
; SHADERTEST: call <4 x float> @llpc.image.fetch.f32.1D.lod.constoffset{{.*}}({{.*}}, i32 2, i32 3, i32 4,{{.*}})
; SHADERTEST: call <8 x i32> {{.*}} @llpc.call.desc.load.resource.v8i32(i32 1, i32 0,{{.*}}, i1 false)
; SHADERTEST: call <4 x float> @llpc.image.fetch.f32.2D.lod.constoffset{{.*}}({{.*}}, <2 x i32> <i32 5, i32 5>, i32 6, <2 x i32> <i32 7, i32 7>,{{.*}})
; SHADERTEST: call <8 x i32> {{.*}} @llpc.call.desc.load.resource.v8i32(i32 0, i32 1, i32 0, i1 false)
; SHADERTEST: call <4 x float> @llpc.image.fetch.f32.3D.lod.constoffset{{.*}}({{.*}}, <3 x i32> <i32 1, i32 1, i32 1>, i32 2, <3 x i32> <i32 3, i32 3, i32 3>,{{.*}})
; SHADERTEST: call <8 x i32> {{.*}} @llpc.call.desc.load.resource.v8i32(i32 0, i32 2, i32 0, i1 false)
; SHADERTEST: call <4 x float> @llpc.image.fetch.f32.Rect.constoffset{{.*}}({{.*}}, <2 x i32> <i32 4, i32 4>, <2 x i32> <i32 5, i32 5>,{{.*}})
; SHADERTEST: call <8 x i32> {{.*}} @llpc.call.desc.load.resource.v8i32(i32 0, i32 3, i32 0, i1 false)
; SHADERTEST: call <4 x float> @llpc.image.fetch.f32.1DArray.lod.constoffset{{.*}}({{.*}}, <2 x i32> <i32 5, i32 5>, i32 6, i32 7,{{.*}})
; SHADERTEST: call <8 x i32> {{.*}} @llpc.call.desc.load.resource.v8i32(i32 2, i32 0,{{.*}}, i1 false)
; SHADERTEST: call <4 x float> @llpc.image.fetch.f32.2DArray.lod.constoffset{{.*}}({{.*}}, <3 x i32> <i32 1, i32 1, i32 1>, i32 2, <2 x i32> <i32 3, i32 3>,{{.*}})

; SHADERTEST-LABEL: {{^// LLPC}}  pipeline patching results
; SHADERTEST: call <4 x float> @llvm.amdgcn.image.load.mip.1d.v4f32.i32(i32 15, i32 6, i32 3,{{.*}}, i32 0, i32 0)
; SHADERTEST: call <4 x float> @llvm.amdgcn.image.load.mip.2d.v4f32.i32(i32 15, i32 12, i32 12, i32 6,{{.*}}, i32 0, i32 0)
; SHADERTEST: call <4 x float> @llvm.amdgcn.image.load.mip.3d.v4f32.i32(i32 15, i32 4, i32 4, i32 4, i32 2,{{.*}}, i32 0, i32 0)
; SHADERTEST: call <4 x float> @llvm.amdgcn.image.load.2d.v4f32.i32(i32 15, i32 9, i32 9,{{.*}}, i32 0, i32 0)
; SHADERTEST: call <4 x float> @llvm.amdgcn.image.load.mip.1darray.v4f32.i32(i32 15, i32 12, i32 5, i32 6,{{.*}}, i32 0, i32 0)
; SHADERTEST: call <4 x float> @llvm.amdgcn.image.load.mip.2darray.v4f32.i32(i32 15, i32 4, i32 4, i32 1, i32 2,{{.*}}, i32 0, i32 0)
; SHADERTEST: AMDLLPC SUCCESS
*/
// END_SHADERTEST